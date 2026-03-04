export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preload" href="/images/auth/day.webp" as="image" type="image/webp" />
      <link rel="preload" href="/images/auth/night.webp" as="image" type="image/webp" />
      {children}
    </>
  );
}
