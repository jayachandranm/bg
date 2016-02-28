#!/bin/bash
#
# This script updates various programs I use on my computer that I do
# not manage through apt-get.
#
# https://ericjmritz.name/2013/05/24/shell-script-to-update-programs/
#
######################################################################

SW_DIR="/home/arkbg/dev/github/bg"
RUN_DIR="/home/arkbg/dev"
BKUP_DIR="/home/arkbg/dev/bkup"

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
# sub-directory in $SW_DIR.
function checkout_latest_master() {
    echo "Updating $1"
    cd "$SW_DIR/$1" \
        && git pull origin     
#        && git pull origin     \
#        && git fetch origin     \
#        && git checkout master  \
#        && git merge origin/master
#        && git merge --ff-only origin/master
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

function wait_and_copy() {
    now=`date +"%m_%d_%Y"`
    #
    file1="sense_2.py"
    file2="sendfile_2.py"
    file3="sw_update.sh"
    file4="github_check_update.sh"
    file5="server_stat.sh"
    echo "Backing up current files.."
    cp "$RUN_DIR/$file1" "$BKUP_DIR/$file1_$now"
    cp "$RUN_DIR/$file2" "$BKUP_DIR/$file2_$now"
    cp "$RUN_DIR/$file3" "$BKUP_DIR/$file3_$now"
    cp "$RUN_DIR/$file4" "$BKUP_DIR/$file4_$now"
    cp "$RUN_DIR/$file5" "$BKUP_DIR/$file5_$now"
    sleep 5s
    echo "Copying files to RUN directory.."
    cp "$SW_DIR/apps/sense/$file1" "$RUN_DIR/."
    cp "$SW_DIR/apps/sense/$file2" "$RUN_DIR/."
    cp "$SW_DIR/tools/$file3" "$RUN_DIR/."
    cp "$SW_DIR/tools/$file4" "$RUN_DIR/."
    cp "$SW_DIR/tools/$file5" "$RUN_DIR/."
    echo "Files copied."
}

checkout_latest_master "apps"
checkout_latest_master "tools"
#checkout_latest_master "web"
wait_and_copy

# Remove my home /tmp directory created by some of the installation
# processes above.
#if [ -d "/home/arkbg/dev/tmp" ]; then
#    rm -rf "/home/arkbg/dev/tmp"
#fi

# Record the time so that I can see when was the last time I updated
# all of these programs.
echo "$(date)" > "$RUN_DIR/Update-Programs-Timestamp.txt"
