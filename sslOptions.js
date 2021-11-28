
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exit } = require('process');

export const genSSLOptions = (fqdn) => {

    let sslOptions = {
        secureProtocol:'TLSv1_2_method',
        requestCert: false,
        rejectUnauthorized: false
      };

    const sslDirs = ['/opt/Certs/', 'ssl/']
    const sslDir = sslDirs.find(dir => fs.existsSync(dir+fqdn+'.key') )
    if (!sslDir) {
      console.log(`Can not find SSL key file (${fqdn+'.key'} in ${sslDirs})`)
      console.log('ERROR: can not start server.')
      exit()
    }

    const certExts = ['.pem', '.cer', '.cert']
    const certExt = certExts.find( ext => fs.existsSync(sslDir+fqdn+ext))
    if (!certExt) {
      console.log(`Can not find SSL cert file ${fqdn} (${certExts.join(', ')} in ${sslDir})`)
      console.log('ERROR: can not start server.')
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

