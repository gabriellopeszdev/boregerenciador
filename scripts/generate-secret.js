const crypto = require("crypto")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function generateSecret(type, length = 32) {
  switch (type) {
    case "base64":
      return crypto.randomBytes(length).toString("base64")

    case "hex":
      return crypto.randomBytes(length).toString("hex")

    case "base64url":
      return crypto.randomBytes(length).toString("base64url")

    case "alphanumeric":
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
      let result = ""
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result

    case "uuid":
      return crypto.randomUUID()

    case "jwt":
      // JWT secret - base64url encoded, good for JWT signing
      return crypto.randomBytes(64).toString("base64url")

    case "session":
      // Session secret - strong random string
      return crypto.randomBytes(48).toString("base64")

    default:
      return crypto.randomBytes(32).toString("base64")
  }
}

function showMenu() {
  console.log("\n🔐 Gerador de Secrets para Haxball Admin")
  console.log("=====================================")
  console.log("1. NextAuth Secret (Recomendado)")
  console.log("2. Base64 (32 bytes)")
  console.log("3. Base64 (64 bytes)")
  console.log("4. Hexadecimal (32 bytes)")
  console.log("5. Hexadecimal (64 bytes)")
  console.log("6. Base64URL (32 bytes)")
  console.log("7. Alfanumérico (32 caracteres)")
  console.log("8. Alfanumérico (64 caracteres)")
  console.log("9. UUID v4")
  console.log("10. JWT Secret (64 bytes)")
  console.log("11. Session Secret (48 bytes)")
  console.log("12. Personalizado")
  console.log("0. Sair")
  console.log("=====================================")
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

async function main() {
  let continuar = true

  while (continuar) {
    showMenu()

    const escolha = await askQuestion("Escolha uma opção (0-12): ")

    let secret = ""
    let description = ""

    switch (escolha) {
      case "1":
        secret = generateSecret("base64", 32)
        description = "NextAuth Secret (Base64, 32 bytes)"
        break

      case "2":
        secret = generateSecret("base64", 32)
        description = "Base64 Secret (32 bytes)"
        break

      case "3":
        secret = generateSecret("base64", 64)
        description = "Base64 Secret (64 bytes)"
        break

      case "4":
        secret = generateSecret("hex", 32)
        description = "Hexadecimal Secret (32 bytes)"
        break

      case "5":
        secret = generateSecret("hex", 64)
        description = "Hexadecimal Secret (64 bytes)"
        break

      case "6":
        secret = generateSecret("base64url", 32)
        description = "Base64URL Secret (32 bytes)"
        break

      case "7":
        secret = generateSecret("alphanumeric", 32)
        description = "Alfanumérico Secret (32 caracteres)"
        break

      case "8":
        secret = generateSecret("alphanumeric", 64)
        description = "Alfanumérico Secret (64 caracteres)"
        break

      case "9":
        secret = generateSecret("uuid")
        description = "UUID v4"
        break

      case "10":
        secret = generateSecret("jwt")
        description = "JWT Secret (Base64URL, 64 bytes)"
        break

      case "11":
        secret = generateSecret("session")
        description = "Session Secret (Base64, 48 bytes)"
        break

      case "12":
        const tipo = await askQuestion("Tipo (base64/hex/base64url/alphanumeric): ")
        const tamanho = await askQuestion("Tamanho em bytes (padrão 32): ")
        const tamanhoFinal = Number.parseInt(tamanho) || 32
        secret = generateSecret(tipo, tamanhoFinal)
        description = `${tipo.toUpperCase()} Secret (${tamanhoFinal} bytes)`
        break

      case "0":
        continuar = false
        console.log("\n👋 Até logo!")
        break

      default:
        console.log("\n❌ Opção inválida!")
        continue
    }

    if (secret) {
      console.log("\n✅ Secret gerado com sucesso!")
      console.log("=====================================")
      console.log(`Tipo: ${description}`)
      console.log(`Secret: ${secret}`)
      console.log(`Tamanho: ${secret.length} caracteres`)
      console.log("=====================================")

      const copiar = await askQuestion("\nDeseja gerar outro secret? (s/n): ")
      if (copiar.toLowerCase() !== "s" && copiar.toLowerCase() !== "sim") {
        continuar = false
        console.log("\n👋 Até logo!")
      }
    }
  }

  rl.close()
}

// Executar o script
main().catch((error) => {
  console.error("❌ Erro ao executar o script:", error.message)
  process.exit(1)
})
