type BrandLogoProps = {
  className?: string;
  imgClassName?: string;
  alt?: string;
};

export function BrandLogo({
  className = "grid h-10 w-10 place-items-center rounded-2xl bg-white p-1 shadow-sm",
  imgClassName = "h-full w-full object-contain",
  alt = "ResolveR",
}: BrandLogoProps) {
  return (
    <div className={className}>
      <img src="/resolver-logo.png" alt={alt} className={imgClassName} />
    </div>
  );
}
