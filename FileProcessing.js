'use strict'

export function ReadJsonFile(reader, huga){
    if(FileInfo.ChgFlg == 0){
        huga = JSON.parse(reader.result);
    }else{
        const jsonDatas = JSON.parse(reader.result);
        for(const jdata of jsonDatas){
            huga.push(jdata);
        }
    }
    return huga;
}

export function ReadCsvFile(reader, huga){
    if(FileInfo.ChgFlg == 0){
        huga = csv2json(reader.result);
    }else{
        const csvDatas = csv2json(reader.result);
        for(const cdata of csvDatas){
            huga.push(cdata);
        }
    }
    return huga;
}

export function ReadConfFile(reader, huga){
    if(FileInfo.ChgFlg == 0){
        huga = confTojson(reader.result);
    }else{
        const confDatas = confTojson(reader.result);
        for(const confdata of confDatas){
            huga.push(confdata);
        }
    }
    return huga;
}

export function ReadXmlFile(reader, huga){
    if(FileInfo.ChgFlg == 0){
        huga = xmlTojson(reader.result);
    }else{
        const xmlDatas = xmlTojson(reader.result);
        for(const xdata of xmlDatas){
            huga.push(xdata);
        }
    }
    return huga;
}
