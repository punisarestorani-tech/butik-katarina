// Kie.ai Virtual Try-On Integration

const KIE_API_BASE = 'https://api.kie.ai'

interface KieGenerateResponse {
  code: number
  msg: string
  data: {
    taskId: string
  }
}

interface KieRecordResponse {
  code: number
  msg: string
  data: {
    successFlag: number // 0=processing, 1=success, 2-3=failed
    resultImageUrl?: string
    originImageUrl?: string
    completeTime?: string
  }
}

export async function generateTryOn(
  userImageUrl: string,
  clothingImageUrl: string
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_KIE_API_KEY
  if (!apiKey) {
    throw new Error('Kie.ai API ključ nije konfigurisan.')
  }

  try {
    // Step 1: Generate the try-on image
    const generateResponse = await fetch(`${KIE_API_BASE}/api/v1/flux/kontext/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Virtual try-on: Take the person from the first image and dress them in the clothing/outfit shown in the second image.
        Keep the person's face, hair, and body exactly the same.
        Only change their clothes to match the outfit from the second image.
        The result should look like a natural fashion photo.
        First image (person): ${userImageUrl}
        Second image (clothing): ${clothingImageUrl}`,
        inputImage: userImageUrl,
        model: 'flux-kontext-pro',
        aspectRatio: '3:4',
        outputFormat: 'png',
      }),
    })

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text()
      throw new Error(`Kie.ai greška: ${errorText}`)
    }

    const generateResult: KieGenerateResponse = await generateResponse.json()

    if (generateResult.code !== 200) {
      throw new Error(generateResult.msg || 'Greška pri pokretanju generisanja')
    }

    const taskId = generateResult.data.taskId

    // Step 2: Poll for the result
    let attempts = 0
    const maxAttempts = 60 // Max 2 minutes (2s intervals)

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds

      const statusResponse = await fetch(
        `${KIE_API_BASE}/api/v1/flux/kontext/record-info?taskId=${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      )

      if (!statusResponse.ok) {
        throw new Error('Greška pri provjeri statusa')
      }

      const statusResult: KieRecordResponse = await statusResponse.json()

      if (statusResult.data.successFlag === 1 && statusResult.data.resultImageUrl) {
        return statusResult.data.resultImageUrl
      } else if (statusResult.data.successFlag >= 2) {
        throw new Error('Generisanje nije uspjelo. Pokušajte ponovo.')
      }

      attempts++
    }

    throw new Error('Generisanje je isteklo. Pokušajte ponovo.')
  } catch (error: any) {
    console.error('Kie.ai API error:', error)
    throw new Error(error.message || 'Greška pri generisanju slike.')
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

// Upload image to get URL (for Kie.ai which requires URLs)
export async function uploadImageToStorage(
  base64Data: string,
  fileName: string,
  supabaseClient: any
): Promise<string> {
  // Convert base64 to blob
  const base64Response = await fetch(base64Data)
  const blob = await base64Response.blob()

  const filePath = `tryon/${Date.now()}-${fileName}`

  const { data, error } = await supabaseClient.storage
    .from('clothing')
    .upload(filePath, blob, {
      contentType: blob.type,
      upsert: true
    })

  if (error) {
    throw new Error('Greška pri uploadu slike: ' + error.message)
  }

  const { data: urlData } = supabaseClient.storage
    .from('clothing')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}
