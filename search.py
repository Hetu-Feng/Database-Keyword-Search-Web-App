import pandas as pd
import numpy as np
import requests
import csv
import json
import re
import sys


# do the search with user input words.

def search(words_search):
    
    # get index from firebase
    response = requests.get(url)
    index_dict = json.loads(response.text)

    
    counter_dict = {}
    counter_dict['country'] = {}
    counter_dict['city'] = {}
    counter_dict['countrylanguage'] = {}
    

    # see if the word in the table
    # for each table, based on the index dictionary, get corresponding primary key and the count

    for word in words_search:
        for key, value in index_dict.items():
            if word == key:
                
                for dic in value:
                    if dic['TABLE'] == 'country':
                        
                        
                        if dic['CODE'] in counter_dict['country'].keys():
                            counter_dict['country'][dic['CODE']] +=1
                        else:
                            counter_dict['country'][dic['CODE']] = 1
                    
                    elif dic['TABLE'] == 'city':
                        
                        
                        if dic['ID'] in counter_dict['city'].keys():
                            counter_dict['city'][dic['ID']] +=1
                        else:
                            counter_dict['city'][dic['ID']] =1
                    
                    elif dic['TABLE'] == 'countrylanguage':
                        
                        
                        if dic['LANGUAGE'] in counter_dict['countrylanguage'].keys():
                            counter_dict['countrylanguage'][dic['LANGUAGE']] +=1
                        else:
                            counter_dict['countrylanguage'][dic['LANGUAGE']] =1
         

    result = {}

    #  sort frequency and add to the result

    for table, value in counter_dict.items():
        keys = []
        sorted_list = sorted(value.items(), key=lambda x: x[1], reverse=True)
        for i in sorted_list:
            keys.append(i[0])
            result[table] = keys
    
    
    print(result)



if __name__ == '__main__':

    url = 'https://inf551-hw1-cc234.firebaseio.com/index.json'

    words = sys.argv[1:]
    search(words)


