FROM eclipse-mosquitto:2.0.18

COPY check_mosquitto.sh /usr/local/bin/check_mosquitto.sh
RUN chmod +x /usr/local/bin/check_mosquitto.sh

COPY mosquitto.conf /mosquitto/config/mosquitto.conf
