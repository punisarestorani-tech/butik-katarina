import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export async function generateTryOn(
  userImageBase64: string,
  clothingImageBase64: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      },
    })

    const prompt = `Ti si AI asistent za virtuelno probanje odjeće u ekskluzivnom butiku.

ZADATAK: Kreiraj realističnu sliku osobe sa PRVE slike koja nosi odjeću sa DRUGE slike.

PRAVILA:
1. SAČUVAJ IDENTITET: Lice, kosa, ten i građa osobe sa prve slike moraju ostati IDENTIČNI
2. PRENESI ODJEĆU: Uzmi odjeću (haljinu, majicu, pantalone, itd.) sa druge slike
3. PRILAGODI: Odjeća mora izgledati prirodno na osobi - ispravne sjene, nabori, proporcije
4. KVALITET: Rezultat mora izgledati kao profesionalna modna fotografija
5. POZADINA: Zadrži neutralnu pozadinu

VAŽNO: Osoba na rezultatu mora biti ISTA osoba kao na prvoj slici, samo sa drugom odjećom!`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: userImageBase64.replace(/^data:image\/\w+;base64,/, '')
        }
      },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: clothingImageBase64.replace(/^data:image\/\w+;base64,/, '')
        }
      }
    ])

    const response = await result.response
    const text = response.text()

    // If the model returns an image, extract it
    // For now, return a placeholder - actual implementation depends on Gemini's image generation capability
    return text

  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Greška pri generisanju slike. Pokušajte ponovo.')
  }
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}
