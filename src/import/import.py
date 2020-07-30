import csv
import json
import mysql.connector
import numpy as np
import pandas as pd
import re
import requests
import sys


def get_connector(username, password, host, database_name):
    
    cnx = mysql.connector.connect(user=username, password=password, host=host, database=database_name)
    
    return cnx 


def close_connector():
    
    cnx.close()
    

def find_tables(cnx, database_name):
    
    tables = []
    cursor = cnx.cursor()
    switch_database_query = 'use {};'.format(database_name)
    show_tables_query = 'show tables;'
    cursor.execute(switch_database_query)
    cursor.execute(show_tables_query)
    for table_name in cursor:
        tables.append(table_name[0])
        
    return tables


def find_headers(table):
    
    columns = []
    table_column_query = 'select column_name from information_schema.columns where table_name = "{}" order by ordinal_position'.format(table)
    cursor = cnx.cursor()
    cursor.execute(table_column_query)
    for row in cursor:
        columns.append(row[0])

    return columns
    
    
def query_data(cnx, query):
    
    data = []
    cursor = cnx.cursor()
    cursor.execute(query)
    for row in cursor:
        new_row = []
        for element in row:
            element = str(element)
            if element == '–' or element == '' or element == 'None':
                element = 'NULL'
            new_row.append(element)
        data.append(new_row)
    cursor.close()
    
    return data


def export_csv(columns, data):

    output_file = open('{}.csv'.format(table), 'w')
    writer = csv.writer(output_file)
    writer.writerow(columns)
    for row in data:
        writer.writerow(row)


def load_file(database, filename):
    
    file_name = filename.lower().split('.')[0]

    df = pd.read_csv(filename, encoding = 'latin-1')
    df = df.replace("'","", regex = True)
    df = df.replace(r'[^\w]',' ',regex=True)
    j = df.to_json(orient='records')
    data_for_indexing = json.loads(j)
    
    if file_name == 'country':
        primarykey = df['Code'].unique().tolist()
    elif file_name == 'city':
        primarykey = df['ID'].unique().tolist()  
    elif file_name == 'countrylanguage':
        primarykey = df['Language'].unique().tolist()
    elif file_name =='actor':
        primarykey = df['actor_id'].unique().tolist()
    elif file_name == 'film':
        primarykey = df['film_id'].unique().tolist()
    elif file_name == 'perform':
        primarykey = df['actor_id'].unique().tolist()
    elif file_name == 'album':
        primarykey = df['AlbumId'].unique().tolist()
    elif file_name == 'artist':
        primarykey = df['ArtistId'].unique().tolist()
    elif file_name == 'track':
        primarykey = df['TrackId'].unique().tolist()

    temp = ""
    count = len(primarykey)

    for key in primarykey:
        count-=1
        if file_name == 'country':
            code_info = df[df['Code']==key].to_json(orient = 'records')[1:-1]
            code_json = '"'+ key + '": ' + code_info 
        elif file_name == 'city':
            code_info = df[df['ID']==key].to_json(orient = 'records')[1:-1]
            code_json = '"'+ str(key) +'":' + code_info
        elif file_name == 'countrylanguage':
            code_info = df[df['Language']==key].to_json(orient = 'records')
            code_json = '"'+ key + '": ' + code_info 
        elif file_name =='actor':
            code_info = df[df['actor_id']==key].to_json(orient = 'records')[1:-1]
            code_json = '"'+ str(key) +'":' + code_info
        elif file_name == 'film':
            code_info = df[df['film_id']==key].to_json(orient = 'records')[1:-1]
            code_json = '"'+ str(key) +'":' + code_info
        elif file_name == 'perform':
            code_info = df[df['actor_id']==key].to_json(orient = 'records')
            code_json = '"'+ str(key) +'":' + code_info
        elif file_name == 'album':
            code_info = df[df['AlbumId']==key].to_json(orient = 'records')[1:-1]
            code_json = '"'+ str(key) +'":' + code_info
        elif file_name == 'artist':
            code_info = df[df['ArtistId']==key].to_json(orient = 'records')[1:-1]
            code_json = '"'+ str(key) +'":' + code_info
        elif file_name == 'track':
            code_info = df[df['TrackId']==key].to_json(orient = 'records')[1:-1]
            code_json = '"'+ str(key) +'":' + code_info  


        temp  += code_json
        if count > 0:
            temp +=','

    data_json =  '{'+temp + '}'

    url = 'https://inf551-e6e4d.firebaseio.com/{}/{}.json'.format(database, file_name)
    #url = 'https://inf551-9f9f7.firebaseio.com/{}/{}.json'.format(database, file_name)
    requests.put(url, data_json)

    return data_for_indexing


def load_perform_filmkey(database, filename):
    file_name = filename.lower().split('.')[0]

    df = pd.read_csv(filename, encoding = 'latin-1')
    df = df.replace("'","", regex = True)
    df = df.replace(r'[^\w]',' ',regex=True)
    j = df.to_json(orient='records')
    data_for_indexing = json.loads(j)

    if file_name == 'perform':
        primarykey_p = df['film_id'].unique().tolist()

    temp_p = ""
    count_p = len(primarykey_p)
    for key in primarykey_p:
        count_p-=1
        if file_name == 'perform':
            code_info_p = df[df['film_id']==key].to_json(orient = 'records')
            code_json_p = '"'+ str(key) +'":' + code_info_p

        temp_p  += code_json_p
        if count_p > 0:
            temp_p +=','


    data_json_p =  '{'+temp_p + '}'

    url = 'https://inf551-e6e4d.firebaseio.com/{}/{}.json'.format(database, file_name)
    #url = 'https://inf551-9f9f7.firebaseio.com/{}/{}.json'.format(database, file_name)
    requests.patch(url, data_json_p)




def load_world_index(database, country, city, countrylanguage):
 
    inverted_index = {}
    numbers = ['Population', 'Percentage', 'IsOfficial', 'SurfaceArea', 'IndepYear', 'LifeExpectancy', 'GNP', 'GNPOld', 'Capital']
    
    for dic in country:
        code = dic['Code']
        for key, value in dic.items():
            if key not in numbers and value != None and value != '':
                for word in value.lower().split(' '):
                    if word in inverted_index.keys():
                        inverted_index[word].append({'TABLE': "country", 'COLUMN': key, 'PK': code})
                    else:
                        inverted_index[word] = [{'TABLE': "country", 'COLUMN': key, 'PK': code}]

    for dic in city:
        ID = dic['ID']
        for key, value in dic.items():
            if key not in numbers and value != None and value != '':
                if type(value) == str:
                    for word in value.lower().split(' '):
                        if word in inverted_index.keys():
                            inverted_index[word].append({'TABLE': "city", 'COLUMN': key, 'PK': ID})
                        else:
                            inverted_index[word] = [{'TABLE': "city", 'COLUMN': key,'PK': ID}]
                else:
                    word = value
                    if word in inverted_index.keys():
                        inverted_index[word].append({'TABLE': "city", 'COLUMN': key, 'PK': ID})
                    else:
                        inverted_index[word] = [{'TABLE': "city",'COLUMN': key, 'PK': ID}]
                    
    for dic in countrylanguage:
        Language = dic['Language']
        for key, value in dic.items():
            if key not in numbers and value != None and value != '':
                for word in value.lower().split(' '):
                    if word in inverted_index.keys():
                        inverted_index[word].append({'TABLE': "countrylanguage", 'COLUMN': key, 'PK': Language})
                    else:
                        inverted_index[word] = [{'TABLE': "countrylanguage", 'COLUMN': key, 'PK': Language}]
    
    inverted_index.pop("")
    inverted_index_json = json.dumps(inverted_index)
    #url_index = 'https://inf551-e6e4d.firebaseio.com/{}/index.json'.format(database)
    url_index = 'https://inf551-a4b1a.firebaseio.com/{}/index.json'.format(database)  
    response = requests.put(url_index, inverted_index_json)
    

def load_music_index(database, album, artist, track):
 
    inverted_index = {}
    numbers = ['Milliseconds', 'Bytes', 'UnitPrice']

    for dic in album:
        album_id = dic['AlbumId']
        for key, value in dic.items():
            if key not in numbers and value != None and value != '':
                if type(value) == str:
                    for word in value.lower().split(' '):
                        if word in inverted_index.keys():
                            inverted_index[word].append({'TABLE': "album", 'COLUMN': key, 'PK': album_id})
                        else:
                            inverted_index[word] = [{'TABLE': "album", 'COLUMN': key, 'PK': album_id}]
                else: 
                    word = value
                    if word in inverted_index.keys():
                        inverted_index[word].append({'TABLE': "album", 'COLUMN': key, 'PK': album_id})
                        inverted_index[word] = [{'TABLE': "album", 'COLUMN': key, 'PK': album_id}]
    
    for dic in artist:
        artist_id = dic['ArtistId']
        for key, value in dic.items():
            if key not in numbers and value != None and value != '':
                if type(value) == str:
                    for word in value.lower().split(' '):
                        if word in inverted_index.keys():
                            inverted_index[word].append({'TABLE': "artist", 'COLUMN': key, 'PK': artist_id})
                        else:
                            inverted_index[word] = [{'TABLE': "artist", 'COLUMN': key, 'PK': artist_id}]
                else: 
                    word = value
                    if word in inverted_index.keys():
                        inverted_index[word].append({'TABLE': "artist", 'COLUMN': key, 'PK': artist_id})
                    else:
                        inverted_index[word] = [{'TABLE': "artist", 'COLUMN': key, 'PK': artist_id}]
    
    for dic in track:
        track_id = dic['TrackId']
        for key, value in dic.items():
            if key not in numbers and value != None and value != '':
                if type(value) == str:
                    for word in value.lower().split(' '):
                        if word in inverted_index.keys():
                            inverted_index[word].append({'TABLE': "track", 'COLUMN': key, 'PK': track_id})
                        else:
                            inverted_index[word] = [{'TABLE': "track", 'COLUMN': key, 'PK': track_id}]
                else: 
                    word = value
                    if word in inverted_index.keys():
                        inverted_index[word].append({'TABLE': "track", 'COLUMN': key, 'PK': track_id})
                    else:
                        inverted_index[word] = [{'TABLE': "track", 'COLUMN': key, 'PK': track_id}]
    
    inverted_index.pop("")
    inverted_index_json = json.dumps(inverted_index)
    url_index = 'https://inf551-e6e4d.firebaseio.com/{}/index.json'.format(database)  
    # url_index = 'https://inf551-a4b1a.firebaseio.com/{}/index.json'.format(database)  
    response = requests.put(url_index, inverted_index_json)
    

def load_movie_index(database, actor, film, perform):
 
    inverted_index = {}
    numbers = ['release_year', 'rental_duration', 'rental_rate', 'length', 'replacement_cost']
    for dic in actor:
        actor_id = dic['actor_id']
        for key, value in dic.items():
            if key not in numbers and value != None and value != '':
                if type(value) == str:
                    for word in value.lower().split(' '):
                        if word in inverted_index.keys():
                            inverted_index[word].append({'TABLE': "actor", 'COLUMN': key, 'PK': actor_id})
                        else:
                            inverted_index[word] = [{'TABLE': "actor", 'COLUMN': key, 'PK': actor_id}]
                else: 
                    word = value
                    if word in inverted_index.keys():
                        inverted_index[word].append({'TABLE': "actor", 'COLUMN': key, 'PK': actor_id})
                    else:
                        inverted_index[word] = [{'TABLE': "actor", 'COLUMN': key, 'PK': actor_id}]
    
    for dic in film:
        film_id = dic['film_id']
        for key, value in dic.items():
            if key not in numbers and value != None and value != '':
                if type(value) == str:
                    for word in value.lower().split(' '):
                        if word in inverted_index.keys():
                            inverted_index[word].append({'TABLE': "film", 'COLUMN': key, 'PK': film_id})
                        else:
                            inverted_index[word] = [{'TABLE': "film", 'COLUMN': key, 'PK': film_id}]
                else: 
                    word = value
                    if word in inverted_index.keys():
                        inverted_index[word].append({'TABLE': "film", 'COLUMN': key, 'PK': film_id})
                    else:
                        inverted_index[word] = [{'TABLE': "film", 'COLUMN': key, 'PK': film_id}]

    for dic in perform:
        actor_id = dic['actor_id']
        film_id = dic['film_id']
        for key, value in dic.items():
            if key not in numbers and value != None and value != '':
                if 'ACTOR' in value: 
                    if type(value) == str:
                        for word in value.lower().split(' '):
                            if word in inverted_index.keys():
                                inverted_index[word].append({'TABLE': "perform", 'COLUMN': key, 'PK': actor_id})
                            else:
                                inverted_index[word] = [{'TABLE': "perform", 'COLUMN': key, 'PK': actor_id}]
                    else: 
                        word = value
                        if word in inverted_index.keys():
                            inverted_index[word].append({'TABLE': "perform", 'COLUMN': key, 'PK': actor_id})
                        else:
                            inverted_index[word] = [{'TABLE': "perform", 'COLUMN': key, 'PK': actor_id}]
                elif 'FILM' in value:
                    if type(value) == str:
                        for word in value.lower().split(' '):
                            if word in inverted_index.keys():
                                inverted_index[word].append({'TABLE': "perform", 'COLUMN': key, 'PK': film_id})
                            else:
                                inverted_index[word] = [{'TABLE': "perform", 'COLUMN': key, 'PK': film_id}]
                    else: 
                        word = value
                        if word in inverted_index.keys():
                            inverted_index[word].append({'TABLE': "perform", 'COLUMN': key, 'PK': film_id})
                        else:
                            inverted_index[word] = [{'TABLE': "perform", 'COLUMN': key, 'PK': film_id}]
                        
    inverted_index_json = json.dumps(inverted_index)
    url_index = 'https://inf551-e6e4d.firebaseio.com/{}/index.json'.format(database) 
    #url_index = 'https://inf551-9f9f7.firebaseio.com/{}/index.json'.format(database)  
    response = requests.put(url_index, inverted_index_json)
    

if __name__ == '__main__':
    
    database_name = sys.argv[1]
    database = sys.argv[2]
    username = 'inf551'
    password = 'inf551'
    host = '127.0.0.1'
    cnx = get_connector(username, password, host, database_name)
    tables = find_tables(cnx, database_name)
    for table in tables:
        columns = find_headers(table)
        query = 'select * from {};'.format(table)
        data = query_data(cnx, query)
        export_csv(columns, data)
    close_connector()

    if database == "world":
        print('Start loading data into Firebase...')
        country = load_file(database, 'country.csv')
        city = load_file(database, 'city.csv')
        countrylanguage = load_file(database, 'countrylanguage.csv')
        print('Finish loading data, start loading inverted indexes...')
        load_world_index(database, country, city, countrylanguage)
        print('Finish loading inverted indexes!')    

    elif database == "music":
        print('Start loading data into Firebase...')
        album = load_file(database,'Album.csv')
        artist = load_file(database, 'Artist.csv')
        track = load_file(database, 'Track.csv')
        print('Finish loading data, start loading inverted indexes...')
        load_music_index(database, album, artist, track)
        print('Finish loading inverted indexes!')    

    elif database == "movie":
        print('Start loading data into Firebase...')
        actor = load_file(database, 'actor.csv')
        film = load_file(database,'film.csv')
        perform = load_file(database,'perform.csv')
        load_perform_filmkey(database,'perform.csv')
        print('Finish loading data, start loading inverted indexes...')
        load_movie_index(database, actor, film, perform)
        print('Finish loading inverted indexes!')    

