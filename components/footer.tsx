export function Footer() {
  return (
    <footer
      className="border-t px-4 py-4 mt-12 flex flex-col sm:flex-row items-center justify-between gap-2"
      style={{ borderColor: "var(--gx)" }}
    >
      <p
        className="font-mono text-[10px] tracking-widest"
        style={{ color: "var(--gd)" }}
      >
        built by Nyamu Wanyoike
      </p>
      <p
        className="font-mono text-[10px] tracking-widest flex gap-3"
        style={{ color: "var(--gd)" }}
      >
        <a
          href="https://github.com/nyamu5"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          github.com/nyamu5
        </a>
        <span>·</span>
        <a
          href="https://linkedin.com/in/nyamu5"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          linkedin.com/in/nyamu5
        </a>
      </p>
    </footer>
  );
}
