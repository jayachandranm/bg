#!/bin/bash
#
# This script updates various programs I use on my computer that I do
# not manage through apt-get.
#
######################################################################

SOFTWARE_DIRECTORY="/home/arkbg/dev/github/bg"

# Do not allow the script to run as root.  Otherwise the programs
# which have Git repositories will end up fetching and creating
# objects as root, leading to permission problems later on when using
# the repositories in general.
if [ "$(id -u)" == "0" ]; then
    echo "This script cannot run as root"
    exit 1
fi

# Fetches the latest updates from the remote origin Git repository and
# fast-forwards the 'master' branch so that it reflects any updates.
# The function takes one argument, which is the name of a
# sub-directory in $SOFTWARE_DIRECTORY.
function checkout_latest_master() {
    echo "Updating $1"
    cd "$SOFTWARE_DIRECTORY/$1" \
        && git fetch origin     \
        && git checkout master  \
        && git merge --ff-only origin/master
}

# This performs checkout_latest_master() and takes the same first
# arugment, but also takes a second argument which is a prefix to give
# to 'configure'.  The function then invokes make to build and install
# the program.
function configure_and_make() {
    checkout_latest_master "$1"      \
        && ./configure --prefix="$2" \
        && make
        if [ "$?" -eq 0 ]; then
            sudo make install
        fi
}

checkout_latest_master "apps"
checkout_latest_master "tools"
#checkout_latest_master "web"

#configure_and_make "Git" "/usr/local"
#configure_and_make "PHP" "/opt/php"

# jq
#checkout_latest_master "jq" && make

# Git Documentation
#echo "Updating Git Documentation"
#cd "$SOFTWARE_DIRECTORY/Git" \
#    && make doc html         \
#    && sudo make install-doc install-html

# tup
#echo "Updating tup"
#cd "$SOFTWARE_DIRECTORY/tup" \
#    && ./build.sh

# LuaJIT
#echo "Updating LuaJIT"
#cd "$SOFTWARE_DIRECTORY/LuaJIT" \
#    && git fetch origin \
#    && git merge --ff-only origin/master \
#    && make \
#    && sudo make install

# Remove my home /tmp directory created by some of the installation
# processes above.
if [ -d "/home/eric/tmp" ]; then
    rm -rf "/home/eric/tmp"
fi
