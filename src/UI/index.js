function getDB() {
	database = document.getElementById("select").value;
	//console.log(database);
}


function getInput() {
	keyword = document.getElementById("input").value.toLowerCase().split(' ');
	const index = keyword.indexOf("");
    if (index > -1) {
  		keyword.splice(index, 1);
	}
	//console.log(keyword);
}


function submit() {
    t0 = performance.now();
    var check_list = [];
	var search_result = document.getElementById('search_result');
	search_result.innerText = '';

	for (var i=0; i<keyword.length; i++){

		key = keyword[i]
		var inRef = database + '/index/' + key;
		var dbRef = firebase.database().ref(inRef);
		//console.log("dbref:" + dbRef);

		dbRef.on('value', function(snapshot){

			snapshot.forEach(function(child){
		  		var childData = child.val();
			  	//console.log(childData);
		    	var inRef2 = database + "/" + childData.TABLE + "/" + childData.PK;
		    	var column_name = childData.COLUMN;
		    	var dbRef2 = firebase.database().ref(inRef2);
		        //console.log("dbref2:" + dbRef2);
		        //console.log(column_name);

		    	dbRef2.on('value', function(snapshot){
		    		var tuple = snapshot.val();
		    		//console.log('db snapchot on value: ');
		    		//console.log(tuple);
		    		if (Array.isArray(tuple)){
		    			for (var i=0; i<tuple.length; i++){
		    				subtuple = tuple[i];
		    				var tuple_string = JSON.stringify(subtuple);
				    		var check = check_list.includes(tuple_string);
				    		if (check == false){
				    			if (('CountryCode' in subtuple) && ('Language' in subtuple)){
				    				if (subtuple[column_name].toLowerCase().includes(key.toLowerCase())){
			    						check_list.push(tuple_string);
			    					}
			    				}
			    				else{
			    					check_list.push(tuple_string);
			    				}
				  			}
		    			}
		    		}

		    		else{
			    		tuple_string = JSON.stringify(tuple);
			    		var check = check_list.includes(tuple_string);
			    		if (check == false){
			    			if (('CountryCode' in tuple) && ('Language' in tuple)){
			    				if (tuple[column_name].toLowerCase().includes(key.toLowerCase())){
			    					check_list.push(tuple_string);
			    				}
			    			}
			    			else{
			    				check_list.push(tuple_string);
			    			}
			  			};
			  		}
  				});	
			});
		});

	};

	// order tuples based on occurance and show results
	setTimeout(function(){
		var tuple_counts_dict = {}; 
		for (var i=0; i<check_list.length; i++){

			var tuple_li = new Array;
			var new_tuple = check_list[i];
			var tuple_object = JSON.parse(new_tuple);
			var tuple_values = Object.values(tuple_object) 
			//console.log(tuple_values); 

			for (var j=0; j<tuple_values.length; j++){
				if (isNaN(tuple_values[j])){
					var new_word_list = tuple_values[j].toLowerCase().split(' ');
					if (keyword.every(v => new_word_list.includes(v))){
						tuple_counts_dict[new_tuple] = 100
						//console.log('yes')
						break;
					}
					else{
						tuple_counts_dict[new_tuple] = 0
					}
				}
			}

			for (var j=0; j<tuple_values.length; j++){
				if (isNaN(tuple_values[j])){
					var new_word_list = tuple_values[j].toLowerCase().split(' ');
					for(var t=0; t <new_word_list.length; t++){
						var single_word = new_word_list[t];
						tuple_li.push(single_word);
					}
				}
			}
			//console.log(tuple_li);
			
			for (var m=0; m<tuple_li.length; m++){
				var word = tuple_li[m]
				if (keyword.includes(word)){
					tuple_counts_dict[new_tuple] += 1
				}
			}
			//console.log(count);
			//console.log(tuple_counts_dict[new_tuple])
		}

		//console.log(tuple_counts_dict)
		tuples_Sorted = Object.keys(tuple_counts_dict).sort(function(a,b){return tuple_counts_dict[b]-tuple_counts_dict[a]})
		//console.log(tuples_Sorted); 
		console.log(tuples_Sorted.length + " tuples of data are requested from this search operation.");

		for (var k=0; k<tuples_Sorted.length; k++){

			var tuple_string = tuples_Sorted[k]
			var tuple = JSON.parse(tuple_string)
			showresults(tuple, tuple_string, key);
		}
		
	},2000);

	let myGreeting = setTimeout(function() {
  		if (search_result.innerText == ""){
  			search_result.innerHTML = '<p style="color:white">Invalid Keywords or Wrong Database</p>';
  		}
	}, 2500)

	t1 = performance.now();
	console.log("Making a query took " + (t1 - t0) + " milliseconds.");
}


function navigate(mykeyword, mytable){

	t2 = performance.now();
	var mykeyword = mykeyword.toLowerCase();
    var check_list_nav = [];
	var search_result = document.getElementById('search_result');
	document.getElementById("search_result").innerText = "";

	var inRef_nav = database + '/index/' + mykeyword;
	var dbRef_nav = firebase.database().ref(inRef_nav);
	//console.log("dbRef_nav:" + dbRef_nav);

	dbRef_nav.on('value', function(snapshot){

		snapshot.forEach(function(child){
	  		var childData_nav = child.val();
		  	//console.log(childData_nav);
		 	var inRef_nav_2 = database + "/" + childData_nav.TABLE + "/" + childData_nav.PK;
	    	//console.log(childData_nav.TABLE)
	    	var column_name_nav = childData_nav.COLUMN;
	    	var dbRef_nav_2 = firebase.database().ref(inRef_nav_2);
	        //console.log("dbRef_nav_2:" + dbRef_nav_2);

	    	dbRef_nav_2.on('value', function(snapshot){
	    		var tuple_nav = snapshot.val();
	    		if (Array.isArray(tuple_nav)){
	    			for (var i=0; i<tuple_nav.length; i++){
	    				subtuple_nav = tuple_nav[i];
	    				var tuple_string_nav = JSON.stringify(subtuple_nav);
			    		var check_nav = check_list_nav.includes(tuple_string_nav);
			    		if (check_nav == false){
			    			showresults2(subtuple_nav,tuple_string_nav, check_list_nav, mykeyword, column_name_nav, mytable);
			  			} 
	    			}
	    		}

	    		else{
		    		tuple_string_nav = JSON.stringify(tuple_nav);
		    		var check_nav = check_list_nav.includes(tuple_string_nav);
		    		if (check_nav == false){
			    		showresults2(tuple_nav,tuple_string_nav, check_list_nav, mykeyword, column_name_nav, mytable);
		  			};
		  		}
			});	
		});
	});

	t3 = performance.now()
	console.log("Making a navigation took " + (t3 - t2) + " milliseconds.")

	let myGreeting = setTimeout(function() {
  		console.log(check_list_nav.length + " tuples of data are requested from this navigation operation.");
	}, 1000)

}


function showresults(tuple, tuple_string, key){
	
	tuple_string = tuple_string.replace(/"/g, ' ');

	// country table
	if ('Code' in tuple){
		code = tuple.Code
		tuple_list = tuple_string.split(code)
		front = tuple_list[0]
		end = tuple_list[1]
		table_name_co = "country"
		toresult =  '<p style="color:white">' + '<strong style="color:#cc9900"> Country: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_co)" style="color:#00cc00; text-decoration:underline;" >' + code + '</span>' + end + '</p>';
	}

	// city table
	if (('CountryCode' in tuple) && ('ID' in tuple)){
		countrycode = tuple.CountryCode
		tuple_list = tuple_string.split(countrycode)
		front = tuple_list[0]
		end = tuple_list[1]
		table_name_ci = "city"
		toresult = '<p style="color:white">' + '<strong style="color:#0099ff"> City: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_ci)" style="color:#00cc00; text-decoration:underline;">' + countrycode + '</span>' + end + '</p>';

	}

	// countrylanguage table
	if (('CountryCode' in tuple) && ('Language' in tuple)){
		countrycode = tuple.CountryCode
		tuple_list = tuple_string.split(countrycode)
		front = tuple_list[0]
		end = tuple_list[1]
		table_name_cl = "countrylanguage"
		toresult = '<p style="color:white">' + '<strong style="color:#e65c00"> Countrylanguage: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_cl)" style="color:#00cc00; text-decoration:underline;">' + countrycode + '</span>' + end + '</p>';

		// if (tuple[column_name].toLowerCase().includes(key.toLowerCase())){
		// 	search_result.insertAdjacentHTML('beforeend', toresult.replace('{', '').replace('}', ''));
		// }
	}		

	// artist table
	if (('ArtistId' in tuple) && !('AlbumId' in tuple)){
		artistid = tuple.ArtistId
		tuple_list = tuple_string.split(artistid)
		front = tuple_list[0]
		end = tuple_list[1]
		table_name_ar = 'artist'
		toresult = '<p style="color:white">' + '<strong style="color:#cc9900"> Artist: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_ar)" style="color:#00cc00; text-decoration:underline;">'  + artistid + '</span>' + end + '</p>';
	}

	// album table
	if (('AlbumId' in tuple) && ('ArtistId' in tuple)){
		albumid = tuple.AlbumId
		artistid = tuple.ArtistId
		tuple_list = tuple_string.split(albumid)
		tuple_list2 = tuple_string.split(artistid)
		front = tuple_list[0]
		end = tuple_list2[1]
		table_name_al = 'album'
		toresult = '<p style="color:white">' + '<strong style="color:#0099ff"> Album: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_al)" style="color:#00cc00; text-decoration:underline;">' + albumid + '</span>' + ' , ' + 'ArtistId: ' + '<span onclick="navigate((this.textContent || this.innerText), table_name_al)" style="color:#00cc00; text-decoration:underline;">' + artistid + '</span>' + end + '</p>';
	}

	// track table
	if (('AlbumId' in tuple) && !('ArtistId' in tuple)){
		albumid = tuple.AlbumId
		tuple_list = tuple_string.split(albumid)
		front = tuple_list[0]
		end = tuple_list[1]
		table_name_tr = 'track'
		toresult = '<p style="color:white">' + '<strong style="color:#e65c00"> Track: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_tr)" style="color:#00cc00; text-decoration:underline;">' + albumid + '</span>' + end + '</p>';
	}

	// actor table
	if (('actor_id' in tuple) && !('film_id' in tuple)){
		actorid = tuple.actor_id
		tuple_list = tuple_string.split(actorid)
		front = tuple_list[0]
		end = tuple_list[1]
		table_name_ac = 'actor'
		toresult = '<p style="color:white">' + '<strong style="color:#cc9900"> Actor: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_ac)" style="color:#00cc00; text-decoration:underline;">' + actorid + '</span>' + end + '</p>';
	}

	// film table
	if (!('actor_id' in tuple) && ('film_id' in tuple)){
		filmid = tuple.film_id
		tuple_list = tuple_string.split(filmid)
		front = tuple_list[0]
		end = tuple_list[1]
		table_name_fi = 'film'
		toresult = '<p style="color:white">' + '<strong style="color:#0099ff"> Film: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_fi)" style="color:#00cc00; text-decoration:underline;">' + filmid + '</span>' + end + '</p>';
	}

	// perform table
	if (('actor_id' in tuple) && ('film_id' in tuple)){
		actorid = tuple.actor_id
		filmid = tuple.film_id
		tuple_list = tuple_string.split(actorid)
		tuple_list2 = tuple_string.split(filmid)
		front = tuple_list[0]
		end = tuple_list2[1]
		table_name_pe = 'perform'
		toresult = '<p style="color:white">' + '<strong style="color:#e65c00"> Perform: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_pe)" style="color:#00cc00; text-decoration:underline;">' + actorid + '</span>' + ' , ' + 'film_id: ' + '<span onclick="navigate((this.textContent || this.innerText), table_name_pe" style="color:#00cc00; text-decoration:underline;">' + filmid + '</span>' + end + '</p>'
	}


	search_result.insertAdjacentHTML('beforeend', toresult.replace('{', '').replace('}', ''));
}


function showresults2(tuple, tuple_string, check_list, key, column_name, table){
	
	// query country
	if (table == 'country'){
		if (('CountryCode' in tuple) && ('ID' in tuple)){
			countrycode = tuple.CountryCode
			tuple_string = tuple_string.replace(/"/g, ' ');
			tuple_list = tuple_string.split(countrycode)
			front = tuple_list[0]
			end = tuple_list[1]
			table_name_ci_nav = "city";
			toresult = '<p style="color:white">' + '<strong style="color:#0099ff"> City: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_ci_nav)" style="color:#00cc00; text-decoration:underline;">' + countrycode + '</span>' + end + '</p>';
			
			if (tuple_string.toLowerCase().includes(column_name.toLowerCase() + ' : ' + key.toLowerCase())){
				search_result.insertAdjacentHTML('beforeend', toresult.replace('{', '').replace('}', ''));
				check_list.push(tuple_string);
			}
		}

		if (('CountryCode' in tuple) && ('Language' in tuple)){
			countrycode = tuple.CountryCode
			tuple_string = tuple_string.replace(/"/g, ' ');
			tuple_list = tuple_string.split(countrycode)
			front = tuple_list[0]
			end = tuple_list[1]
			table_name_cl_nav = "countrylanguage";
			toresult = '<p style="color:white">' + '<strong style="color:#e65c00"> Countrylanguage: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText),table_name_cl_nav)" style="color:#00cc00; text-decoration:underline;">' + countrycode + '</span>' + end + '</p>';
			
			if (tuple_string.toLowerCase().includes(column_name.toLowerCase() + ' : ' + key.toLowerCase())){
				search_result.insertAdjacentHTML('beforeend', toresult.replace('{', '').replace('}', ''));
				check_list.push(tuple_string);
			}
		}
	}

    // query city 
	if (table == 'city'){
		if ('Code' in tuple){
			code = tuple.Code
			tuple_string = tuple_string.replace(/"/g, ' ');
			tuple_list = tuple_string.split(code)
			front = tuple_list[0]
			end = tuple_list[1]
			table_name_co_nav = "country";
			toresult =  '<p style="color:white">' + '<strong style="color:#cc9900"> Country: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText),table_name_co_nav)" style="color:#00cc00; text-decoration:underline;">' + code + '</span>' + end + '</p>';
			
			search_result.insertAdjacentHTML('beforeend', toresult.replace('}', '').replace('{', ''));
			check_list.push(tuple_string);
		}

		if (('CountryCode' in tuple) && ('Language' in tuple)){
			countrycode = tuple.CountryCode
			tuple_string = tuple_string.replace(/"/g, ' ');
			tuple_list = tuple_string.split(countrycode)
			front = tuple_list[0]
			end = tuple_list[1]
			table_name_cl_nav = "countrylanguage";
			toresult = '<p style="color:white">' + '<strong style="color:#e65c00"> Countrylanguage: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText),table_name_cl_nav)" style="color:#00cc00; text-decoration:underline;">' + countrycode + '</span>' + end + '</p>';
			
			if (tuple_string.toLowerCase().includes(column_name.toLowerCase() + ' : ' + key.toLowerCase())){
				search_result.insertAdjacentHTML('beforeend', toresult.replace('{', '').replace('}', ''));
				check_list.push(tuple_string);
			}
		}
	}

	// query countrylanguage
	if (table == 'countrylanguage'){
		if ('Code' in tuple){
			code = tuple.Code
			tuple_string = tuple_string.replace(/"/g, ' ');
			tuple_list = tuple_string.split(code)
			front = tuple_list[0]
			end = tuple_list[1]
			table_name_co_nav = "country";
			toresult =  '<p style="color:white">' + '<strong style="color:#cc9900"> Country: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText),table_name_co_nav)" style="color:#00cc00; text-decoration:underline;">' + code + '</span>' + end + '</p>';
			
			search_result.insertAdjacentHTML('beforeend', toresult.replace('}', '').replace('{', ''));
			check_list.push(tuple_string);
		}

		if (('CountryCode' in tuple) && ('ID' in tuple)){
			countrycode = tuple.CountryCode
			tuple_string = tuple_string.replace(/"/g, ' ');
			tuple_list = tuple_string.split(countrycode)
			front = tuple_list[0]
			end = tuple_list[1]
			table_name_ci_nav = "city"
			toresult = '<p style="color:white">' + '<strong style="color:#0099ff"> City: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText),table_name_ci_nav)" style="color:#00cc00; text-decoration:underline;">' + countrycode + '</span>' + end + '</p>';
			
			if (tuple_string.toLowerCase().includes(column_name.toLowerCase() + ' : ' + key.toLowerCase())){
				search_result.insertAdjacentHTML('beforeend', toresult.replace('{', '').replace('}', ''));
				check_list.push(tuple_string);
			}
		}

	}

	// query actor
	if (table == 'actor'){
		if (('actor_id' in tuple) && ('film_id' in tuple)){
			actorid = tuple.actor_id
			filmid = tuple.film_id
			tuple_string = tuple_string.replace(/"/g, ' ');
			tuple_list = tuple_string.split(actorid)
			tuple_list2 = tuple_string.split(filmid)
			front = tuple_list[0]
			end = tuple_list2[1]
			table_name_pe_nav = 'perform'
			toresult = '<p style="color:white">' + '<strong style="color:#e65c00"> Perform: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_pe_nav)" style="color:#00cc00; text-decoration:underline;">' + actorid + '</span>' + ' , ' + 'film_id: ' + '<span onclick="navigate((this.textContent || this.innerText), table_name_pe_nav)" style="color:#00cc00; text-decoration:underline;">' + filmid + '</span>' + end + '</p>'

			search_result.insertAdjacentHTML('beforeend', toresult.replace('}', '').replace('{', ''));
			check_list.push(tuple_string);
		}
	}

	// query film
	if (table == 'film'){
		if (('actor_id' in tuple) && ('film_id' in tuple)){
			actorid = tuple.actor_id
			filmid = tuple.film_id
			tuple_string = tuple_string.replace(/"/g, ' ');
			tuple_list = tuple_string.split(actorid)
			tuple_list2 = tuple_string.split(filmid)
			front = tuple_list[0]
			end = tuple_list2[1]
			table_name_pe_nav = 'perform'
			toresult = '<p style="color:white">' + '<strong style="color:#e65c00"> Perform: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_pe_nav)" style="color:#00cc00; text-decoration:underline;">' + actorid + '</span>' + ' , ' + 'film_id: ' + '<span onclick="navigate((this.textContent || this.innerText), table_name_pe_nav)" style="color:#00cc00; text-decoration:underline;">' + filmid + '</span>' + end + '</p>'

			search_result.insertAdjacentHTML('beforeend', toresult.replace('}', '').replace('{', ''));
			check_list.push(tuple_string);
		}
	}

	// query perform
	if (table == 'perform'){
		if (key.includes('actor')){
			if (('actor_id' in tuple) && !('film_id' in tuple)){
				actorid = tuple.actor_id
				tuple_string = tuple_string.replace(/"/g, ' ');
				tuple_list = tuple_string.split(actorid)
				front = tuple_list[0]
				end = tuple_list[1]
				table_name_ac_nav = 'actor'
				toresult = '<p style="color:white">' + '<strong style="color:#cc9900"> Actor: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_ac_nav)" style="color:#00cc00; text-decoration:underline;">' + actorid + '</span>' + end + '</p>';

				search_result.insertAdjacentHTML('beforeend', toresult.replace('}', '').replace('{', ''));
				check_list.push(tuple_string);
			}
		}
		else if (key.includes('film')){
			if (!('actor_id' in tuple) && ('film_id' in tuple)){
				filmid = tuple.film_id
				tuple_string = tuple_string.replace(/"/g, ' ');
				tuple_list = tuple_string.split(filmid)
				front = tuple_list[0]
				end = tuple_list[1]
				table_name_fi_nav = 'film'
				toresult = '<p style="color:white">' + '<strong style="color:#0099ff"> Film: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_fi_nav)" style="color:#00cc00; text-decoration:underline;">' + filmid + '</span>' + end + '</p>';

				search_result.insertAdjacentHTML('beforeend', toresult.replace('}', '').replace('{', ''));
				check_list.push(tuple_string);
			}
		}
	}

	// query artist
	if (table == 'artist'){
		if (('AlbumId' in tuple) && ('ArtistId' in tuple)){
			albumid = tuple.AlbumId
			artistid = tuple.ArtistId
			tuple_string = tuple_string.replace(/"/g, ' ');
			tuple_list = tuple_string.split(albumid)
			tuple_list2 = tuple_string.split(artistid)
			front = tuple_list[0]
			end = tuple_list2[1]
			table_name_al_nav = 'album'
			toresult = '<p style="color:white">' + '<strong style="color:#0099ff"> Album: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_al_nav)" style="color:#00cc00; text-decoration:underline;">' + albumid + '</span>' + ' , ' + 'ArtistId: ' + '<span onclick="navigate((this.textContent || this.innerText), table_name_al_nav)" style="color:#00cc00; text-decoration:underline;">' + artistid + '</span>' + end + '</p>';

			search_result.insertAdjacentHTML('beforeend', toresult.replace('}', '').replace('{', ''));
			check_list.push(tuple_string);
		}
	}

	// query track
	if (table == 'track'){
		if (('AlbumId' in tuple) && ('ArtistId' in tuple)){
			albumid = tuple.AlbumId
			artistid = tuple.ArtistId
			tuple_string = tuple_string.replace(/"/g, ' ');
			tuple_list = tuple_string.split(albumid)
			tuple_list2 = tuple_string.split(artistid)
			front = tuple_list[0]
			end = tuple_list2[1]
			table_name_al_nav = 'album'
			toresult = '<p style="color:white">' + '<strong style="color:#0099ff"> Album: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_al_nav)" style="color:#00cc00; text-decoration:underline;">' + albumid + '</span>' + ' , ' + 'ArtistId: ' + '<span onclick="navigate((this.textContent || this.innerText), table_name_al_nav)" style="color:#00cc00; text-decoration:underline;">' + artistid + '</span>' + end + '</p>';

			search_result.insertAdjacentHTML('beforeend', toresult.replace('}', '').replace('{', ''));
			check_list.push(tuple_string);
		}
	}

	// query album
	if (table == 'album'){
		if (key.includes('artist')){
			if (('ArtistId' in tuple) && !('AlbumId' in tuple)){
				artistid = tuple.ArtistId
				tuple_string = tuple_string.replace(/"/g, ' ');
				tuple_list = tuple_string.split(artistid)
				front = tuple_list[0]
				end = tuple_list[1]
				table_name_ar_nav = 'artist'
				toresult = '<p style="color:white">' + '<strong style="color:#cc9900"> Artist: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_ar_nav)" style="color:#00cc00; text-decoration:underline;">'  + artistid + '</span>' + end + '</p>';
				
				search_result.insertAdjacentHTML('beforeend', toresult.replace('}', '').replace('{', ''));
				check_list.push(tuple_string);
			}
		}

	
		if (key.includes('album')){
			if (('AlbumId' in tuple) && !('ArtistId' in tuple)){
				albumid = tuple.AlbumId
				tuple_string = tuple_string.replace(/"/g, ' ');
				tuple_list = tuple_string.split(albumid)
				front = tuple_list[0]
				end = tuple_list[1]
				table_name_tr_nav = 'track'
				toresult = '<p style="color:white">' + '<strong style="color:#e65c00"> Track: </strong>' + front + '<span onclick="navigate((this.textContent || this.innerText), table_name_tr_nav)" style="color:#00cc00; text-decoration:underline;">' + albumid + '</span>' + end + '</p>';
				
				search_result.insertAdjacentHTML('beforeend', toresult.replace('}', '').replace('{', ''));
				check_list.push(tuple_string);
			}
		}
	}
}

