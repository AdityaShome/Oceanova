
import os, joblib, numpy as np
from itertools import product
from collections import Counter
def _kmer_freqs(seq, k):
    alphabet = ['A','C','G','T']
    seq = (seq or "").upper()
    total = 0; counts = {}
    for i in range(0, max(1, len(seq)-k+1)):
        kmer = seq[i:i+k]
        if any(ch not in alphabet for ch in kmer): continue
        counts[kmer] = counts.get(kmer,0) + 1; total += 1
    ordered = [''.join(p) for p in product(alphabet, repeat=k)]
    vec = np.zeros(len(ordered), dtype=np.float32)
    if total>0:
        for idx, kmer in enumerate(ordered):
            vec[idx] = counts.get(kmer, 0) / total
    return vec
def _scalar_feats(seq):
    alphabet = ['A','C','G','T']
    s = (seq or "").upper(); L = len(s)
    if L==0: return np.zeros(6, dtype=np.float32)
    countA = s.count('A'); countC = s.count('C'); countG = s.count('G'); countT = s.count('T')
    n_count = sum(1 for ch in s if ch not in alphabet)
    gc = (countG + countC) / L
    n_frac = n_count / L
    freqs = []
    for c in [countA, countC, countG, countT]:
        if c>0:
            p = c/L; freqs.append(-p * np.log(p + 1e-12))
    entropy = sum(freqs)
    return np.array([L, gc, n_frac, countA/L if L>0 else 0.0, countC/L if L>0 else 0.0, entropy], dtype=np.float32)

def predict_sequences(seqs):
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # load artifacts
    meta_path = os.path.join(script_dir, 'stack_meta_clf.pkl')
    le_path = os.path.join(script_dir, 'stack_label_encoder.pkl')
    lgb_path = os.path.join(script_dir, 'lgb_models_list.pkl')
    xgb_path = os.path.join(script_dir, 'xgb_models_list.pkl')
    
    if not os.path.exists(meta_path):
        raise RuntimeError(f"stack_meta_clf.pkl not found at {meta_path}")
    
    meta = joblib.load(meta_path)
    le = joblib.load(le_path)
    lgb_models = joblib.load(lgb_path)
    xgb_models = joblib.load(xgb_path)
    import xgboost as xgb
    # embeddings: transformer inference not included in this helper (user should create embeddings or have X_full)
    # Here we will attempt to use encoder_embeddings.npy if it matches the number of seqs, otherwise zero-embeds
    emb_path = os.path.join(script_dir, 'encoder_embeddings.npy')
    Nq = len(seqs)
    if os.path.exists(emb_path):
        emb = np.load(emb_path)
        if emb.shape[0] == Nq:
            emb_use = emb
        else:
            emb_use = np.zeros((Nq, 256), dtype=np.float32)
    else:
        emb_use = np.zeros((Nq, 256), dtype=np.float32)
    k3 = np.vstack([_kmer_freqs(s,3) for s in seqs]).astype(np.float32)
    k4 = np.vstack([_kmer_freqs(s,4) for s in seqs]).astype(np.float32)
    scal = np.vstack([_scalar_feats(s) for s in seqs]).astype(np.float32)
    Xq = np.hstack([emb_use, k3, k4, scal])
    # get base preds avg
    p_l = []
    for m in lgb_models:
        try:
            p = m.predict(Xq, num_iteration=getattr(m,'best_iteration',None) or None)
        except Exception:
            p = m.predict(Xq)
        p_l.append(p)
    p_lgb = np.mean(p_l, axis=0)
    p_x = []
    for m in xgb_models:
        try:
            p = m.predict(xgb.DMatrix(Xq))
        except Exception:
            p = m.predict(xgb.DMatrix(Xq))
        p_x.append(p)
    p_xgb = np.mean(p_x, axis=0)
    meta_in = np.hstack([p_lgb, p_xgb])
    probs = meta.predict_proba(meta_in)
    preds = probs.argmax(axis=1)
    out = []
    for i,pred in enumerate(preds):
        out.append({'pred_label': le.classes_[pred], 'prob_vector': probs[i].tolist()})
    return out
