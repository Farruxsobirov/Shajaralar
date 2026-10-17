import ShajaraView from "@/components/ShajaraView";
import { getAzolar, getSozlamalar } from "@/lib/data";
import { shajaraQur } from "@/lib/tree";

export default async function Home() {
  const [azolar, sozlamalar] = await Promise.all([getAzolar(), getSozlamalar()]);
  const shajara = shajaraQur(azolar);

  return (
    <ShajaraView shajara={shajara} sarlavha={sozlamalar.sarlavha} tavsif={sozlamalar.tavsif} />
  );
}
