# MORPC Regional Sustainability Dashboard Server Configuration
## Overview

The MORPC RSD project uses two servers - one for development and one for production.  The application environment (software versions, webserver configuration, application code, etc.) for the production server is intended to be an exact clone of the application environment for the development server, however the production server will be updated only for scheduled public releases of the application.

More details about each server are included in the sections below:
  - [Development server](#development-server)
  - [Production server](#production-server)
  - [Common configuration](#common-configuration)

The servers are virtual machines maintained by [ASC Technology Services](https://asctech.osu.edu/).  Key points of contact are:

  - Slauson, Justin <slauson.4@osu.edu>
  - Carroll, Josh <carroll.432@osu.edu>

ASCTech maintains the configuration for both servers using [Puppet](https://puppet.com/).  Any local changes to configuration files will be overwritten during the next Puppet synchronization.  Changes must be submitted to ASCTech using their [ticketing system](https://osuasc.teamdynamix.com/TDClient/Requests/ServiceDet?ID=13982) in order to be made permanent.  **All critical server configuration files (excluding restricted access files) should be included in this repository and updated whenever changes are made on the server.**

ASCTech pushes software updates in the evening of the third Tuesday of the month.

## How to connect

  1. Request access using the ASC Tech [ticketing system](https://osuasc.teamdynamix.com/TDClient/Requests/ServiceDet?ID=13982).  If you require admin (root) access, be sure to specify this.  In that case you will be assigned a name.#a username with elevated privileges.
  2. Connect to the [OSU VPN](https://osuasc.teamdynamix.com/TDClient/KB/ArticleDet?ID=14542)
  3. Connect to the desired server using SSH
  4. Log in using your name.# credentials (or name.#a if you need admin access)
  5. Use "sudo" to execute a command with root privileges (use "sudo -s" to change to the root account)

## Development server
  - Operating system: Red Hat Enterprise Linux Server release 7.6 (Maipo)
  - Hostname: cura-sco-dev.asc.ohio-state.edu
  - Alias: sco-dev.asc.ohio-state.edu
  - IP address: 164.107.176.149
  - Open ports: 22/SSH, 80/HTTP, 443/HTTPS

## Production server

- Operating system: Red Hat Enterprise Linux Server release 7.6 (Maipo)
- Hostname: cura-sco.asc.ohio-state.edu
- Alias: sco.asc.ohio-state.edu
- IP address: 164.107.176.150
- Open ports: 22/SSH, 80/HTTP, 443/HTTPS

## Common configuration
### Secure Shell (SSH)

Port 22, password authentication

### Apache httpd web server

- Web root: /var/www/{server hostname}
- Service control: service httpd {start | stop | restart}
- Config file locations:
  - /etc/httpd/conf/
  - /etc/httpd/conf.d/
  - /var/www/{server hostname}/.htaccess
- Log location: /var/log/httpd

### Postgres database

TBD
