import { AuthService } from "../../../../../../backend/services/auth/auth.service";
import { MarcaFabricaSistemaInyeccionService } from "../../../../../../backend/services/mantenimiento/maestro-de-codigos/marca-fabrica-sistema-inyeccion.service";

export default async function handler(req, res) {
  try {
    const user = await AuthService.ValidateAccessToken(req, res);
    user && AuthService.AdministradorFeatures(user.roles);

    const id = Number(req.query.id);
    if (req.method === "PUT") {
      const result = await MarcaFabricaSistemaInyeccionService.updateMarcaFabricaSistemaInyeccion(id, req.body);
      return res.status(200).json(result);
    }

    if (req.method === "DELETE") {
      const result = await MarcaFabricaSistemaInyeccionService.deleteMarcaFabricaSistemaInyeccion(id);
      return res.status(200).json(result);
    }
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: error.meta.cause });
    }
    return res.status(400).json({ error: error.message });
  }
}
