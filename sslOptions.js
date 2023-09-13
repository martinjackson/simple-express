
const fs = require('fs')
const { exit } = require('process')

// const tls = require('tls')

const genSSLOptions = (fqdn, requestCert, port) => {

   // taken from io.js' TLS docs
   // https://iojs.org/api/tls.html

  const ciphers = [
    "DHE-RSA-AES256-SHA384",
    "DHE-RSA-AES256-SHA256",
    "DHE-RSA-AES128-SHA256",

    "ECDHE-ECDSA-AES128-GCM-SHA256",
    "ECDHE-ECDSA-AES256-GCM-SHA384",
    "ECDHE-ECDSA-AES128-SHA",
    "ECDHE-ECDSA-AES256-SHA",
    "ECDHE-ECDSA-AES128-SHA256",
    "ECDHE-ECDSA-AES256-SHA384",

    "HIGH",

    "!CBC",
    "!RSA",

    "!ECDHE-RSA-AES256-SHA384",    // WEAK
    "!ECDHE-RSA-AES256-SHA256",    // WEAK
    "!ECDHE-RSA-AES128-SHA256",    // WEAK
    "!aNULL",
    "!eNULL",
    "!EXPORT",
    "!DES",
    "!RC4",
    "!MD5",
    "!PSK",
    "!SRP",
    "!CAMELLIA"
].join(':')

/*

Cipher Suites
# TLS 1.2 (suites in server-preferred order)

TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384       (0xc030)   ECDH x25519 (eq. 3072 bits RSA)   FS	256
TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 (0xcca8)   ECDH x25519 (eq. 3072 bits RSA)   FS	256
TLS_ECDHE_RSA_WITH_ARIA_256_GCM_SHA384      (0xc061)   ECDH x25519 (eq. 3072 bits RSA)   FS	256
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256       (0xc02f)   ECDH x25519 (eq. 3072 bits RSA)   FS	128
TLS_ECDHE_RSA_WITH_ARIA_128_GCM_SHA256      (0xc060)   ECDH x25519 (eq. 3072 bits RSA)   FS	128

at https://www.ssllabs.com/ssltest/analyze.html
*/

    let sslOptions = {
        secureProtocol:'TLSv1_2_method',
        requestCert: requestCert,
        rejectUnauthorized: false,
        ciphers: ciphers,
        honorCipherOrder: true
      }

    // console.log(port+':','sslOptions:', sslOptions);

    const sslDirs = ['/opt/Certs/', 'ssl/']
    const sslDir = sslDirs.find(dir => fs.existsSync(dir+fqdn+'.key') )
    if (!sslDir) {
      console.log(port+':',`Can not find SSL key file (${fqdn+'.key'} in ${sslDirs})`)
      console.log(port+':','ERROR: can not start server.')
      exit()
    }

    const certExts = ['.pem', '.cer', '.crt', '.cert']
    const certExt = certExts.find( ext => fs.existsSync(sslDir+fqdn+ext))
    if (!certExt) {
      console.log(port+':',`Can not find SSL cert file ${fqdn} (${certExts.join(', ')} in ${sslDir})`)
      console.log(port+':','ERROR: can not start server.')
      exit()
    }

    sslOptions.startupMessage = []
    sslOptions.startupMessage.push(`    Using SSL key: ${sslDir+fqdn+'.key'}`)
    sslOptions.key = fs.readFileSync(sslDir+fqdn+'.key')

    sslOptions.startupMessage.push(`    Using SSL cert: ${sslDir+fqdn+certExt}`)
    sslOptions.cert = fs.readFileSync(sslDir+fqdn+certExt)

    if (fs.existsSync(sslDir+'CA.pem')) {
      sslOptions.startupMessage.push(`    Using SSL ca: ${sslDir+'CA.pem'}`)
      sslOptions.ca = fs.readFileSync(sslDir+'CA.pem')
    }

    if (fs.existsSync(sslDir+'cs.cer')) {
      sslOptions.startupMessage.push(`    Using SSL ca: ${sslDir+'CA.pem'}`)
      sslOptions.ca = fs.readFileSync(sslDir+'CA.pem')
    }

    return sslOptions
}

module.exports = { genSSLOptions }
