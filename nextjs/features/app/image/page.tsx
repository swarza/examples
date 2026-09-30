import Image from "next/image";
import photo from "./photo.jpg";

export const metadata = { title: "Image" };

export default function ImagePage() {
  return (
    <main>
      <h1>next/image</h1>
      <p>Resized and converted to WebP or AVIF by the platform, then cached.</p>
      <Image src={photo} alt="A generated gradient" width={640} priority placeholder="blur" />
    </main>
  );
}
