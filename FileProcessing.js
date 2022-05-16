export function ReadJsonFile(){
    if(FileInfo.ChgFlg == 0){
        huga = JSON.parse(reader.result);
    }else{
        const jsonDatas = JSON.parse(reader.result);
        for(const jdata of jsonDatas){
            huga.push(jdata);
        }
    }
}

export function ReadCsvFile(){
    if(FileInfo.ChgFlg == 0){
        huga = csv2json(reader.result);
    }else{
        const csvDatas = csv2json(reader.result);
        for(const cdata of csvDatas){
            huga.push(cdata);
        }
    }
}

export function ReadConfFile(){
    if(FileInfo.ChgFlg == 0){
        huga = confTojson(reader.result);
    }else{
        const confDatas = confTojson(reader.result);
        for(const confdata of confDatas){
            huga.push(confdata);
        }
    }
}

export function ReadXmlFile(){
    if(FileInfo.ChgFlg == 0){
        huga = xmlTojson(reader.result);
    }else{
        const xmlDatas = xmlTojson(reader.result);
        for(const xdata of xmlDatas){
            huga.push(xdata);
        }
    }
}