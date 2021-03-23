

run: clean
	# node splider.js
	proxychains node splider.js

clean:
	rm -rf datas.csv out/*