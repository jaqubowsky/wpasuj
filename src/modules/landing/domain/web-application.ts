import { productName } from "@/shared/brand";
import { pitch } from "./pitch";

export function webApplication(home: URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: productName,
    url: home.href,
    description: pitch,
    inLanguage: "pl",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "PLN" },
  };
}
