FROM drupal:7-apache
MAINTAINER JM <dev@mail.com>

# Add unzip for package installs
# Add mysql-client for drush
# Add pecl redis module
#RUN apt-get update && apt-get install -y unzip \
RUN apt-get update && apt-get install -y unzip mysql-client \
  && pecl install redis \
  && docker-php-ext-enable redis \
  && rm -rf /var/lib/apt/lists/*

# Use our own apache2.conf that has been altered for reverse proxy log support
COPY config/apache2.conf /etc/apache2/apache2.conf

# Install drush
ENV DRUSH_VERSION 8.1.2
RUN curl -L --silent https://github.com/drush-ops/drush/releases/download/${DRUSH_VERSION}/drush.phar > /usr/local/bin/drush \
  && chmod +x /usr/local/bin/drush

# Create the sites/default/files folder so Drupal can write caches to it
RUN mkdir -p sites/default/files && chown www-data:www-data sites/default/files

# Change some PHP defaults.
RUN { \
    echo 'date.timezone = Asia/Singapore'; \
  } > /usr/local/etc/php/conf.d/drupal-base.ini

# Remove some files from the Drupal base install.
#RUN rm CHANGELOG.txt COPYRIGHT.txt INSTALL.mysql.txt INSTALL.pgsql.txt \
#       INSTALL.sqlite.txt INSTALL.txt LICENSE.txt MAINTAINERS.txt \
#       README.txt UPGRADE.txt

# Create an empty favicon.ico so it stops polluting our error logs.
# You might want to add more files here.
RUN touch favicon.ico

# Copy our local settings.php file into the container.
# This file uses a lot of environment variables to connect to services (db, cache)
COPY config/settings.php sites/default/settings.php

# Add Drupal modules, used for development purpose
#RUN mkdir sites/all/modules/development \
#  && drush dl coder devel schema --destination=sites/all/modules/development

# Add Drupal modules, generic contrib
#RUN mkdir sites/all/modules/contrib \
#  && drush dl context ctools date ds entity features google_analytics \
#              libraries redis pathauto strongarm token transliteration \
#              variable views views_bulk_operations wysiwyg-7.x-2.x-dev \
#              xmlsitemap content_menu menu_block menu_position cdn smtp \
#              seckit webform
#RUN mkdir sites/all/modules/contrib \
RUN  drush dl addressfield admin_menu advanced_help bootstrap_fieldgroup ctools devel \
              entity entityreference field_collection field_formatter_class \ 
              field_formatter_settings field_group fontawesome geocoder geofield geophp \ 
              jquery_update libraries logintoboggan module_filter moment \
              og redis views views_bulk_operations views_bootstrap

COPY modules/bgmap sites/all/modules/bgmap
COPY modules/bgtrans sites/all/modules/bgtrans

# Multilingual
#RUN drush dl entity_translation i18n i18nviews l10n_update title

# Media
#RUN drush dl media-2.x-dev file_entity-2.x-dev multiform \
#             media_youtube-2.x-dev media_vimeo-2.x-dev \
#             media_browser_plus-3.x-dev

# Custom modules for running Drupal 7 on AWS
#RUN drush dl log_stdout

# Add Drupal themes
#RUN mkdir sites/all/themes/contrib && drush dl bootstrap
COPY themes/bgtrans sites/all/themes/bgtrans
RUN drush dl bootstrap

COPY libraries sites/all/libraries
COPY files sites/default/files

RUN chown -R www-data.www-data sites

#ENV APACHE_RUN_USER apache
#User ${APACHE_RUN_USER}

#RUN drush en comfort 
#RUN drush pm-enable comfort 
#&& drush vset theme_default comfort

# Add Drupal libraries
#ENV CKEDITOR_VERSION 4.5.10
#RUN curl -L --silent https://github.com/ckeditor/ckeditor-releases/archive/full/${CKEDITOR_VERSION}.zip \
#      -o /tmp/ckeditor.zip \
#      && unzip /tmp/ckeditor.zip -d sites/all/libraries/ \
#      && mv sites/all/libraries/ckeditor-releases-full-${CKEDITOR_VERSION} sites/all/libraries/ckeditor \
#      && rm -f /tmp/ckeditor.zip

# Done.
