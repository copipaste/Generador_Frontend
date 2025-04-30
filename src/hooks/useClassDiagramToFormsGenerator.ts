import { useState, useCallback } from "react";
// Cambia la importación para usar @google/genai
import { GoogleGenAI, createUserContent } from "@google/genai";
import { useMutation } from "@liveblocks/react";

// Define el tipo para la función importFromJSON si la pasas como argumento
type ImportFromJsonFunction = (jsonData: any) => void;

export const useClassDiagramToFormsGenerator = (importFromJSON: ImportFromJsonFunction) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFormsFromDiagram = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Inicializar el cliente de Gemini AI usando GoogleGenAI de @google/genai
      const genAI = new GoogleGenAI({
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
      });
      // Nota: El modelo se especifica en la llamada a generateContent con esta API

      // Convertir la imagen a formato base64
      const reader = new FileReader();
      const fileReadPromise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const dataUrl = await fileReadPromise;
      const base64Data = dataUrl.split(',')[1];

      // Crear la parte de imagen para la API
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      };

      // El prompt proporcionado por el usuario
      const prompt = `
      Esta es una imagen de un diagrama de clases.
      Por favor, analiza esta imagen, identifica las clases y sus atributos, y genera una representación JSON de bocetos de formularios de interfaz de usuario correspondientes a cada clase, que pueda ser utilizada en una herramienta de diseño.

      Para cada clase en el diagrama:
      - Crea un contenedor de formulario (rectángulo).
      - Crea un título para el formulario (elemento de texto) con el nombre de la clase.
      - Para cada atributo de la clase:
        - Crea una etiqueta para el atributo (elemento de texto) con el nombre del atributo.
        - Crea un campo de entrada para el atributo (rectángulo).
      - Si un atributo sugiere un elemento visual como una imagen, represéntalo con un rectángulo y una 'X' dentro, siguiendo el estilo de \`https://placehold.co.\`
      - Asegúrate de que los elementos de cada formulario estén organizados lógicamente.
      - Incluye un botón genérico "Submit" para cada formulario (rectángulo con texto).

      El JSON debe seguir esta estructura para cada elemento de la interfaz generado (contenedores, títulos, etiquetas, campos de entrada, botones):
      {
        "layers": {
          "[ID]": {
            "type": [0 para Rectángulo, 1 para Elipse, 3 para Texto],
            "x": [posición_x],
            "y": [posición_y],
            "height": [altura],
            "width": [ancho],
            "fill": {"r": [0-255], "g": [0-255], "b": [0-255]},
            "stroke": {"r": [0-255], "g": [0-255], "b": [0-255]},
            "opacity": [0-100]
          }
          // Para elementos de texto (tipo 3), incluir: fontSize, text, fontWeight, fontFamily
        },
        "layerIds": ["[ID1]", "[ID2]", ...],
        "roomColor": {"r": 30, "g": 30, "b": 30} // Mantén este color de fondo o ajusta si es necesario para la visualización
      }

      Los elementos deben estar correctamente organizados y en el orden correcto dentro de cada formulario y el JSON.
      Responde solo con el JSON, sin explicaciones.`;

      // Enviar la solicitud a Gemini usando la API de @google/genai
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash", // Especifica el modelo aquí
        contents: [
          createUserContent([ // Usa createUserContent
            prompt,
            imagePart
          ]),
        ],
      });

      // Extraer el texto de la respuesta según la estructura de @google/genai
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("No se pudo obtener respuesta de texto de Gemini");
      }

      // Extraer el JSON de la respuesta (tu lógica actual parece adecuada)
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);

      if (!jsonMatch || !jsonMatch[0]) {
         // Intenta limpiar la respuesta si no es JSON puro
         const cleanedText = text.replace(/```json\n?/, '').replace(/```\n?/, '').trim();
         if (cleanedText.startsWith('{') && cleanedText.endsWith('}')) {
            try {
                const jsonData = JSON.parse(cleanedText);
                importFromJSON(jsonData); // Llama a la función para importar el JSON
            } catch (parseError) {
                console.error("Error al parsear JSON después de limpiar:", parseError);
                console.error("Texto recibido de Gemini:", text);
                throw new Error("La respuesta de Gemini no contenía un JSON válido, incluso después de intentar limpiarla.");
            }
         } else {
            console.error("Respuesta de Gemini no reconocida como JSON:", text);
            throw new Error("No se pudo extraer un JSON válido de la respuesta de Gemini.");
         }
      } else {
          // Parsear el JSON
          const jsonString = jsonMatch[1] || jsonMatch[0];
          try {
              const jsonData = JSON.parse(jsonString);
              importFromJSON(jsonData);
          } catch (parseError) {
              console.error("Error al parsear JSON extraído:", parseError);
              console.error("String JSON intentado:", jsonString);
              console.error("Texto original de Gemini:", text);
              throw new Error("Error al parsear el JSON extraído de la respuesta de Gemini.");
          }
      }

    } catch (err) {
      console.error("Error al procesar diagrama de clases con Gemini AI:", err);
      setError(err instanceof Error ? err.message : "Ocurrió un error desconocido.");
    } finally {
      setIsProcessing(false);
    }
  }, [importFromJSON]);

  return { generateFormsFromDiagram, isProcessing, error };
};