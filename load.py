import pandas as pd
import numpy as np
import requests
import csv
import json
import re
import sys


# NOTE: if needed, you can change the firebase url on line 80 and line 170


# this function will do the cleaning, to_json and upload to firebase

def load_data(filename):

    # using pandas to perform cleaning on the dataset
    # remove non-word non-space characters. remove extra space on the front

    if filename == 'country.csv':
        with open(filename,"r") as file_in, open("country_clean.csv","w") as file_out:
            reader = csv.reader(file_in)
            writer = csv.writer(file_out)
            
            for row in reader:
                if len(row)> 15:
                    for i in range(len(row)-3):
                        if row[i][-1] != "'" and row[i] != " NULL":
                            row[i:i+2] = [''.join(row[i:i+2])]
        

                writer.writerow(row)


        df = pd.read_csv("country_clean.csv")
        
        df = df.rename(columns = lambda x: re.sub('[^\w]','',x))
        df = df.replace("'","", regex = True)
        df = df.replace(r'^\s','',regex=True)
        df[['Code', 'Name', 'Continent', 'Region',
            'IndepYear', 'LocalName','GovernmentForm',
            'HeadOfState', 'Code2']]= df[['Code', 'Name', 'Continent', 'Region', 
                                          'IndepYear', 'LocalName','GovernmentForm',
                                          'HeadOfState', 'Code2']].replace(r'[^\w\s]', ' ',regex = True)
        
    
    
    elif filename == "city.csv":
                        
        df = pd.read_csv("city.csv", encoding = "latin-1")

        df = df.rename(columns = lambda x: re.sub(r'[^\w]','',x))
        df = df.replace("'","", regex = True)
        df = df.replace(r'^\s','',regex=True)
        df[['Name','CountryCode',
            'District']] = df[['Name','CountryCode',
                                                    'District']].replace(r'[^\w\s]', ' ',regex = True)


    else:
        df = pd.read_csv("countrylanguage.csv")
        
        df = df.rename(columns = lambda x: re.sub(r'[^\w]','',x))
        df = df.replace("'","", regex = True)
        df = df.replace(r'^\s','',regex=True)
        df[['CountryCode','Language',
            'IsOfficial']] = df[['CountryCode','Language',
                                 'IsOfficial']].replace(r'[^\w\s]', ' ',regex = True)
    

    df = df.replace("NULL", np.NaN, regex = True)
    df = df.replace("",np.NaN, regex = True)

    
    data_json = df.to_json(orient='records')
    
    node = filename.split('.csv')[0]
    

    url = "https://inf551-hw1-cc234.firebaseio.com/{}.json".format(node)
    

    #PUT 
    requests.put(url, data_json)
    
    fb_json = requests.get(url)
    data_dict = json.loads(fb_json.text)
    
    return data_dict


# This function will get the inverted index for a specific word, given the data in dictionary

def get_index(word, data_all):
    
    num_col = ['SurfaceArea', 'IndepYear','Population','LifeExpectancy', 'GNP', 
               'GNPOld','Capital','ID', 'Population','Percentage']
    

    # go through data values in the 3 dataset seperately, take the key of the value
    # as column name and take the primary key
    

    country_index = []
    for row in data_all[0]:
        for key, value in row.items():
            if key not in num_col:
                if word.lower() in value.lower().split(' '):
                    country_index.append({'TABLE': 'country', 'COLUMN':key, 'CODE': row['Code']})
                    
                    
    city_index = []
    for row in data_all[1]:
        for key, value in row.items():
            if key not in num_col:
                if word.lower() in str(value).lower().split(' '):
                    city_index.append({'TABLE': 'city', 'COLUMN':key, 'ID': row['ID']}) 
               
    
    countrylanguage_index = []
    for row in data_all[2]:
        for key, value in row.items():
            if key not in num_col:
                if word.lower() in str(value).lower().split(' '):
                    countrylanguage_index.append({'TABLE': 'countrylanguage', 'COLUMN':key, 'LANGUAGE': row['Language']})
    
    #merge all to one list
                    
    index_all = country_index + city_index + countrylanguage_index

    return index_all
    

# this function will get all the possible words from dataset and create inverted index
# using above function. will also upload to the index node

def load_index(data_all):    
    
    num_key_col = ['SurfaceArea', 'IndepYear','Population','LifeExpectancy', 'GNP', 
                   'GNPOld','Capital','ID', 'Population','Percentage', 'Language', 'Code', 'IsOfficial']

    words = []


    #loop thru dataset to get all the words

    for data in data_all:
        for record in data:
            if record.values() != '':
                for key, value in record.items():
                    if key not in num_key_col:
                        words.append(value.split(' '))

    words_temp = []
    for lis in words:
        for word in lis:
            if word:
                words_temp.append(word.lower())
    
    words_temp = set(words_temp)
    
    index_dic = {}
    for i in words_temp:
        index_dic[i] = get_index(i,data_all)
    

    index_json = json.dumps(index_dic)
    

    url = "https://inf551-hw1-cc234.firebaseio.com/index.json"
    
    #PUT

    response = requests.put(url, index_json)
    
    return response
        



if __name__ == '__main__':

    data_all = []
    for name in sys.argv[1:]:
        data_all.append(load_data(name))


    load_index(data_all)
    
    
    
    





