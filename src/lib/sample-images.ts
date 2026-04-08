import bolsaMaternidade from "@/assets/products/bolsa-maternidade.jpg";
import kitEnxoval from "@/assets/products/kit-enxoval.jpg";
import mantaBebe from "@/assets/products/manta-bebe.jpg";
import necessaire from "@/assets/products/necessaire.jpg";
import portaFraldas from "@/assets/products/porta-fraldas.jpg";
import catBolsas from "@/assets/categories/bolsas.jpg";
import catEnxoval from "@/assets/categories/enxoval.jpg";
import catNecessaires from "@/assets/categories/necessaires.jpg";
import catFraldas from "@/assets/categories/fraldas.jpg";

// Map product names to local images (used as fallback when DB has no image)
export const productImages: Record<string, string> = {
  "Bolsa Maternidade Floral": bolsaMaternidade,
  "Kit Enxoval Bebê Completo": kitEnxoval,
  "Manta de Bebê Personalizada": mantaBebe,
  "Necessaire com Nome": necessaire,
  "Porta-Fraldas Bordado": portaFraldas,
};

// Map category names to local images
export const categoryImages: Record<string, string> = {
  "Bolsas": catBolsas,
  "Enxoval": catEnxoval,
  "Necessaires": catNecessaires,
  "Fraldas": catFraldas,
};
