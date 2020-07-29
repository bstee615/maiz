FROM python:3.8

WORKDIR /usr/src/app

COPY requirements.txt ./mazedraw/
RUN pip install -r ./mazedraw/requirements.txt

COPY . ./mazedraw/

EXPOSE 80

CMD [ "python", "-m", "mazedraw.serve" ]