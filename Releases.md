
# simple-express Releases

## Version 1.0.52 2023-09-13

```bash
 appServer.js    | 43 +++++++++++++++++++++++++++++++++----------
 sslOptions.js   |  2 +-
```

The new function startHardenedServer() changed it's call signature from

`startHardenedServer(router, port, fqdn, publicDir, httpsFlag, requestCert)`

to

`startHardenedServer(router, config)`

Now port, fqdn, publicDir, httpsFlag, requestCert are all members of the config object

aka.
`startHardenedServer(router, {port, fqdn, publicDir, httpsFlag, requestCert})`

Several of each config values can be omitted and default values will be supplied

| option        | default   |  description                      |
|---------------|-----------|-----------------------------------|
| port          |  3000     | which port to listen for requests |
| fqdn          |  null     | fully qualfied domain name        |
| publicDir     |  '.'      | where index.html can be found     |
| httpsFlag     |  true     | use https (false: use http)       |
| requestCert   |  false    | require user authentication       |

--------------------------------------------

```bash
❯ git log --grep="release "  --pretty="%s %as"
```

## Release 1.0.51 2023-09-06


## Release 1.0.50 2023-09-05


## Release 1.0.49 2023-09-05


## Release 1.0.48 2023-08-30


## Release 1.0.47 2023-08-30


## Release 1.0.46 2023-07-28


## Release 1.0.45 2023-07-28


## Release 1.0.44 2023-07-16


## Release 1.0.43 2023-07-16


## Release 1.0.42 2023-07-14


## Release 1.0.41 2023-07-14


## Release 1.0.40 2023-03-14


## Release 1.0.39 2023-03-14


## Release 1.0.38 2023-03-14


## Release 1.0.37 2023-03-14


## Release 1.0.36 2022-04-25


## Release 1.0.35 2022-03-02


## Release 1.0.34 2022-03-02


## Release 1.0.33 2022-03-02


## Release 1.0.32 2022-03-02


## Release 1.0.31 2022-02-17


## Release 1.0.30 2022-02-17


## Release 1.0.29 2022-02-17


## Release 1.0.28 2021-11-27


## Release 1.0.26 2021-11-27


## Release 1.0.24 2021-11-27


## Release 1.0.22 2021-11-27


## Release 1.0.21 2021-11-27


