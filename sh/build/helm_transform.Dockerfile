FROM alpine:3.11

RUN apk add bash curl openssl git
RUN apk update

RUN curl -fsSL -o /usr/local/bin/kpt https://storage.googleapis.com/kpt-dev/latest/linux_amd64/kpt
RUN chmod +x /usr/local/bin/kpt
ENV PATH /usr/local/bin:$PATH

RUN curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
RUN chmod 700 get_helm.sh
RUN ./get_helm.sh

COPY src/helm_transform.sh /
RUN chmod +x /helm_transform.sh

ENTRYPOINT [ "/helm_transform.sh" ]
