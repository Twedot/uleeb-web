// Deliberately a placeholder — mobile's Requests tab (list + detail,
// accept/decline, and the in-app chat it unlocks) is a substantial build
// of its own, not included in this pass. Swiping right in Discover /
// tapping "Request to view" on a listing still really creates the request
// server-side; there's just nowhere on web yet to see or act on it.
export default function Requests() {
  return (
    <div style={styles.screen}>
      <h1 style={styles.title}>Requests</h1>
      <p style={styles.body}>
        Viewing and responding to requests — plus the chat they unlock — is coming to the web soon.
        For now, manage these from the Uleeb app.
      </p>
    </div>
  );
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 24px', gap: 10 },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: '#181614' },
  body: { fontSize: 14, color: '#5B5750', lineHeight: '21px' },
};
