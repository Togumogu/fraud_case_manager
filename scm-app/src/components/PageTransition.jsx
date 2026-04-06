/**
 * PageTransition — wraps a page with a fade+slide entrance animation.
 * Mount it with a unique `key` to retrigger on page change.
 * Children can opt into stagger via className="scm-stagger".
 */
export default function PageTransition({ children, style = {} }) {
  return (
    <div className="scm-page-transition" style={{ display: "contents", ...style }}>
      {children}
    </div>
  );
}
