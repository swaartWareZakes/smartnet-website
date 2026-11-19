export default function GlobalLoading() {
  return (
    <div className="sn-route-veil is-entering" role="status" aria-live="polite">
      <div className="sn-route-grid" aria-hidden="true" />
      <div className="sn-route-scan" aria-hidden="true" />

      <div className="sn-route-core">
        <div className="sn-route-ring sn-route-ring--outer" aria-hidden="true" />
        <div className="sn-route-ring sn-route-ring--inner" aria-hidden="true" />
        <div className="sn-route-ring sn-route-ring--amber" aria-hidden="true" />
        <span className="sn-route-monogram">SN</span>
      </div>

      <div className="sn-route-readout">
        <strong>SMARTNET // LOADING</strong>
        <span>INITIALISING 3D STAGE</span>
      </div>
    </div>
  );
}
