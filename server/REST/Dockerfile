FROM python:3


WORKDIR /usr/restapi/

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

RUN ["chmod", "+x", "./entrypoint.sh"]

ENTRYPOINT ["./entrypoint.sh" ]