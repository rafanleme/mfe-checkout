import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import type { CartApi, CartSnapshot, AuthApi, Product } from '@mfe/contracts';

async function getApis() {
  const [cartMod, authMod] = await Promise.all([
    import('host/cartApi'),
    import('host/authApi'),
  ]);
  const cartApi = (cartMod as any).default ?? (cartMod as any).cartApi as CartApi;
  const authApi = (authMod as any).default ?? (authMod as any).authApi as AuthApi;
  return { cartApi, authApi };
}

function useGateAndSnapshot() {
  const [snap, setSnap] = useState<CartSnapshot>({ items: [], total: 0, count: 0 });
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let unsub: undefined | (() => void);
    let mounted = true;

    getApis().then(({ cartApi, authApi }) => {
      const auth = authApi.getSnapshot();
      if (!auth.isAuthenticated) {
        navigate('/login?redirect=/checkout');
        return;
      }
      if (!mounted) return;
      setSnap(cartApi.getSnapshot());
      unsub = cartApi.subscribe(setSnap);
      setReady(true);
    });

    return () => { mounted = false; unsub?.(); };
  }, [navigate]);

  return { snap, ready };
}

function CheckoutPage() {
  const { snap, ready } = useGateAndSnapshot();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const canPay = ready && snap.items.length > 0 && !paying && !orderId;

  const onConfirm = async () => {
    if (!canPay) return;
    setPaying(true);
    const { cartApi } = await getApis();

    await new Promise(r => setTimeout(r, 1200));
    const id = 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    setOrderId(id);

    cartApi.clear();
  };

  if (!ready) return <div>Preparando checkout…</div>;

  if (orderId) {
    return (
      <div className="wrap">
        <div className="card">
          <h2 data-testid="order-confirmed">Pedido confirmado 🎉</h2>
          <p>Número do pedido: <strong>{orderId}</strong></p>
          <p>Enviamos um e-mail com a confirmação.</p>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn" onClick={() => navigate('/sales')}>Continuar comprando</button>
            <button className="btn" onClick={() => navigate('/')}>Ir para Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (snap.items.length === 0) {
    return (
      <div className="wrap">
        <div className="card">
          <h2>Seu carrinho está vazio</h2>
          <button className="btn" onClick={() => navigate('/sales')}>Ver produtos</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="card">
        <h2>Checkout</h2>
        <p>Revise seu pedido e confirme o pagamento.</p>

        <ul>
          {snap.items.map(i => (
            <li key={i.id}>
              {i.name} — {i.qty} × R$ {i.price.toFixed(2)} = <strong>R$ {(i.qty*i.price).toFixed(2)}</strong>
            </li>
          ))}
        </ul>

        <p><strong>Total: R$ {snap.total.toFixed(2)}</strong></p>

        <div style={{ marginTop:12 }}>
          <label>Nome impresso no cartão</label>
          <input placeholder="Seu nome" />
          <label>Número do cartão</label>
          <input placeholder="**** **** **** ****" />
        </div>

        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          <button className="btn" onClick={() => navigate('/cart')}>Voltar ao carrinho</button>
          <button className="btn" onClick={onConfirm} disabled={!canPay} data-testid="button-confirm">
            {paying ? 'Processando…' : 'Confirmar pagamento'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutApp() {
  return (
    <Routes>
      <Route path="/" element={<CheckoutPage />} />
    </Routes>
  );
}
