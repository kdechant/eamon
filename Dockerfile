# Use an official Python runtime as a base image
FROM python:3.6.1

#ENV DEBIAN_FRONTEND noninteractive
ENV PYTHONUNBUFFERED 1
ENV IN_DOCKER 1

USER root

# Install APT packages needed to build some python packages
RUN apt-get update
RUN apt-get install -y netcat python-dev libxml2-dev libxslt-dev libffi-dev libssl-dev libmysqlclient-dev
#
#ENV HOME_USER webuser
#ENV HOME_PASS password
#
#RUN useradd -m -s /bin/bash ${HOME_USER} && \
#    echo "${HOME_USER}:${HOME_PASS}"|chpasswd && \
#    adduser ${HOME_USER} sudo && \
#    echo ${HOME_USER}' ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers
#
#USER webuser

# Copy the current directory contents into the container at /app
ADD . /app

# Install any needed packages specified in requirements.txt
WORKDIR /app
RUN pip install -r requirements.txt

# Run manage.py when the container launches
CMD ["python", "manage.py", "runserver"]

# Make port 8000 available to the world outside this container
EXPOSE 8000
