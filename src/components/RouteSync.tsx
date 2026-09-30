import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { productPath } from '../lib/urls';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { formatPrice } from '../lib/format';

const PRODUCT_RE = /^\/product\/([^/]+)/;

/**
 * Keeps the URL and the modal-based UI in sync:
 * - opening a product (from anywhere) pushes /product/:id/:slug, so links are shareable
 * - landing on /product/... opens that product; the browser back button closes it
 * - /admin and /track open the admin panel and the order tracker
 */
export const RouteSync: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    products,
    isLoading,
    selectedProduct,
    openProductDetails,
    closeProductDetails,
    isAdminOpen,
    openAdmin,
    isTrackingOpen,
    openTracking,
    isAccountOpen,
    openAccount,
    settings,
    showToast,
  } = useStore();

  // Last non-product page, used as the "background" when a product modal is closed.
  const backgroundPath = useRef<string>('/shop');
  const productMatch = location.pathname.match(PRODUCT_RE);
  const routeProductId = productMatch ? decodeURIComponent(productMatch[1]) : null;

  useEffect(() => {
    if (!routeProductId) backgroundPath.current = location.pathname + location.search;
  }, [routeProductId, location.pathname, location.search]);

  // URL → state
  useEffect(() => {
    if (routeProductId) {
      if (selectedProduct?.id === routeProductId) return;
      const product = products.find(p => p.id === routeProductId);
      if (product) {
        openProductDetails(product);
      } else if (!isLoading) {
        showToast('That product is no longer available.', 'info');
        navigate('/shop', { replace: true });
      }
    } else if (selectedProduct) {
      closeProductDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeProductId, products, isLoading]);

  // State → URL. The page the product was opened from is kept as `state.background`,
  // so it stays rendered (and keeps its scroll position) behind the product view.
  useEffect(() => {
    const background = (location.state as { background?: unknown } | null)?.background;
    if (selectedProduct) {
      const target = productPath(selectedProduct);
      if (location.pathname !== target) {
        navigate(target, {
          replace: Boolean(routeProductId) && routeProductId === selectedProduct.id,
          state: { background: routeProductId ? background : location },
        });
      }
    } else if (routeProductId) {
      navigate(backgroundPath.current || '/shop');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  // /admin and /track deep links
  useEffect(() => {
    if (location.pathname === '/admin' && !isAdminOpen) openAdmin();
    if (location.pathname === '/track' && !isTrackingOpen) openTracking();
    if (location.pathname === '/account' && !isAccountOpen) openAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!isAdminOpen && location.pathname === '/admin') navigate('/', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminOpen]);

  useEffect(() => {
    if (!isAccountOpen && location.pathname === '/account') navigate('/', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAccountOpen]);

  useEffect(() => {
    if (!isTrackingOpen && location.pathname === '/track') navigate('/', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrackingOpen]);

  // Per-product title/description (other pages set their own).
  useDocumentMeta(
    selectedProduct
      ? {
          title: `${selectedProduct.name} | ${settings.brandName}`,
          description: `${selectedProduct.name}: ${formatPrice(selectedProduct.price)}. ${
            selectedProduct.description?.slice(0, 120) || 'Artificial jewellery'
          } Cash on Delivery all over Pakistan.`,
          image: selectedProduct.images[0],
        }
      : null
  );

  return null;
};
