all: mission.js

mission.js:
	curl -O http://gispub02.sfgov.org/website/sfshare/catalog/planning_neighborhoods.zip
	unzip planning_neighborhoods.zip
	ogr2ogr -f GeoJSON -s_srs EPSG:2227 -t_srs EPSG:4326 planning_neighborhoods.json planning_neighborhoods.shp
	echo "var mission = " >> mission.js;
	cat planning_neighborhoods.json | egrep '"Mission"' | perl -pe "s/ //g" >> mission.js
	echo ";" >> mission.js
	perl -pi -e "s/\\n//g" mission.js
	rm planning_neighborhoods*

clean:
	rm -rf *.js* *.shp *.shx *.sbn *.xml *.prj *.dbf
