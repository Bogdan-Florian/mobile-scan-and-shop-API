if [ -v CODIO_HOSTNAME ]
then
	echo "Codio box detected"
else
	echo "no Codio box detected"
	echo "exiting setup"
	exit 0
fi
sudo chown -R codio:codio .
sudo chmod -R 775 .
echo
echo "============== DELETING OLD FILES ==================="
rm -rf *
rm -rf .*
echo
echo "============== CLONING REPOSITORY ==================="
git clone https://aneab0109@dev.azure.com/aneab0109/5010CEM/_git/5010CEM_API
chmod +x .githooks/*
rm -rf config.sh 
rm .codio
mv codio.json .codio
echo
echo "============= DELETING TEMPORARY FILES =============="
rm -rf *.db  
rm -rf package-lock.json
rm -rf .settings
rm -rf .sqlite_history
rm -rf .bash_history
echo
echo "============== UPDATING DEBIAN TOOLS ==============="
sudo add-apt-repository -y ppa:git-core/ppa
sudo apt update -y
sudo apt upgrade -y
echo
echo "============= INSTALLING DEBIAN TOOLS =============="
sudo apt install -y psmisc lsof tree sqlite3 sqlite3-doc build-essential gcc g++ make git
git --version
echo
echo "============== CHANGING BASH PROMPT ================"
echo "PS1='$ '" >> ~/.profile
source ~/.profile
echo "========= INSTALLING NODE ========="
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install -y nodejs
echo
echo "=========== INSTALLING THE NODE PACKAGES ==========="
echo
rm -rf node_modules
rm -rf package-lock.json
npm install
npm install --save-dev eslint ava 
npm audit fix
echo
echo "=========== SETTING THE FILE PERMISSIONS ==========="
sudo chown -R codio:codio .
sudo chmod -R 775 .
echo
echo "===== CHECKING THE VERSION OF NODEJS INSTALLED ====="
node -v
echo
echo "================= CONFIGURING GIT =================="
git config core.hooksPath .githooks
git config --global merge.commit no
git config --global merge.ff no
echo
echo "================= SETUP COMPLETED ================="