# How to add new services?

You need to write new services in [yaml](https://en.wikipedia.org/wiki/YAML) templates under /services/templates folder.

Example: 

```yaml
# Should be 1.0.0 for new services
templateVersion: 1.0.0
# Default version of the service you would like to add. You can check it in the documentation. 
# This is usually the docker image tag.
defaultVersion: RELEASE.2022-10-15T19-57-03Z
# Link to the official documentation. Shown on the UI.
documentation: https://min.io/docs/minio
# Lower case name of the application. Must be one word!
type: minio
# Fancy name of the application.
name: MinIO
# Short description. Shown on the UI, when you create a new service.
description: A cloud storage server compatible with Amazon S3.
# Other labels. This is searchable in the UI. 
# If this is an alternative software to something else, must listed here for better discoverability.
labels:
  - storage
  - s3
## All the services needed. It is very similar to a docker-compose file!
services:
  # All services must start with $$id! $$id is the main service. 
  # Other service examples: $$id-mysql, $$id-elasticsearch, etc. 
  # $$id is replaced with the actual uuid during creation.
  $$id:
    # Name of the service. Should be fancy name. Shown on the UI.
    name: MinIO
    # Startup command for this service.
    command: server /data --console-address :9001
    # Official documentation for this service.
    documentation: Taken from https://docs.min.io/docs/minio-docker-quickstart-guide.html
    # If a service is depends on another service, should be listed like: 
    # depends_on: ['$$id-mysql']
    depends_on: []
    # Docker image location. $$core_version will be replaced with the defaultVersion.
    image: minio/minio:$$core_version
    # Volume definitions.
    # All volumes must start with $$id!
    volumes:
      - $$id-data-write:/files
    # Required environment variables. 
    # The second part (after =) must start with:
    ## - $$config -> if the data could be saved in text format to Coolify's database.
    ## - $$secret -> if the data needs to be encrypted before saved to Coolify's database.
    ## - $$config_coolify_fqdn_* -> you can define secondary (or any number of) fqdns to a service. 
    ## This is useful if you need to expose more than one domains. 
    ## This will shown on the UI in a separate input field.
    environment:
      - MINIO_SERVER_URL=$$config_coolify_fqdn_minio_console
      - MINIO_BROWSER_REDIRECT_URL=$$config_minio_browser_redirect_url
      - MINIO_DOMAIN=$$config_minio_domain
      - MINIO_ROOT_USER=$$config_minio_root_user
      - MINIO_ROOT_PASSWORD=$$secret_minio_root_password
      - database__connection__user=$$config_mysql_user
    # Ulimits configuration, the same as in docker-compose.
    ulimits:
      nofile:
        soft: 262144
        hard: 262144
    # You can define default configuration files before starting the container. This will be added to the container on start.
    files:
      # location: which file to update before starting the container.
      # content: content of the file. Could use variables here, like $$config_minio_root_user. It will be replaced during deployment. 
      - location: /etc/clickhouse-server/users.d/logging.xml
        content: >-
          <yandex><logger><level>warning</level><console>$$config_minio_root_user</console></logger><query_thread_log
          remove="remove"/><query_log remove="remove"/><text_log
          remove="remove"/><trace_log remove="remove"/><metric_log
          remove="remove"/><asynchronous_metric_log
          remove="remove"/><session_log remove="remove"/><part_log
          remove="remove"/></yandex>
    # Ports that you need to set by Coolify's Proxy.
    ports:
      - '9000'
      - '9001'
    # Advanced proxy configuration.
    proxy:
      # You can bound a port to a secondary fqdn.
      - port: '9000'
        domain: $$config_coolify_fqdn_minio_console
      # If only the port is defined, it means, it will be bound to the primary fqdn.
      - port: '9001'
variables:
    # You need to define all variables here.
    # id: must be variable name you defined in the `environment` part above.
    # name: the used environment variable name that will be configured in the docker configuration
    # label: fancy name of the variable
    # description: small description on what this variable is used for.
    # defaultValue: default value of the variable. Could be several things like:
    ## - empty -> ''
    ## - $$generate_fqdn -> primary fqdn will be set here.
    ## - $$generate_domain -> primary fqdn will be set here, but only the domain part. so if fqdn => `https://coolify.io`, domain will be `coolify.io`.
    ## - $$generate_username -> a username will be generated automatically.
    ## - $$generate_password -> a secure password will be generated automatically.
    ## - $$generate_hex -> generate random hex data with the length of 24 bytes.
    ## - $$generate_hex(Number) -> generate random bytes of hex data with the length of the Number you set. 
    ## - $$generate_network -> set the docker network you set for the service.
    # Optional options:
    # main: You can specify where to show the variable on the UI. Must match with one of the service names, like $$id or $$id_mysql, etc.
    # required: true | false -> Is the variable required or not. Required variables are required on the UI as well.
    # showOnConfiguration: $$secret values are not shown in the configuration by default, only in the secrets part. But it makes sense to show them sometimes, next to the configurations, like for default password for the default user, so you don't need to go to the secrets menu. It is a UX thing.
    # readOnly: true | false -> will be readonly in the UI.
  - id: $$config_coolify_fqdn_minio_console
    name: MINIO_SERVER_URL
    label: MinIO Server URL
    defaultValue: ''
    description: >-
      Specify the URL hostname the MinIO Console should use for connecting to
      the MinIO Server.
    required: true
  - id: $$config_mysql_user
    main: $$id-mysql
    name: MYSQL_USER
    label: MySQL User
    defaultValue: $$generate_username
    description: ''
  - id: $$config_minio_browser_redirect_url
    name: MINIO_BROWSER_REDIRECT_URL
    label: Browser Redirect URL
    defaultValue: $$generate_fqdn
    description: ''
  - id: $$config_minio_domain
    name: MINIO_DOMAIN
    label: Domain
    defaultValue: $$generate_domain
    description: ''
  - id: $$config_minio_root_user
    name: MINIO_ROOT_USER
    label: Root User
    defaultValue: $$generate_username
    description: ''
  - id: $$secret_minio_root_password
    name: MINIO_ROOT_PASSWORD
    label: Root User Password
    defaultValue: $$generate_password
    description: ''
    showOnConfiguration: true
```