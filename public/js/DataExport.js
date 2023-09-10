class DataExport{

    exportDatatable(tableName, dataParams){
        const responseFail = new ResponseFail;

        $.ajax({
            url: Routing.generate(`app_export_${tableName}`),
            type: "POST",
            data: dataParams,
            success: function(){
                console.log('fichier exporté')
            },
            error: function(jqXHR, exception){
                responseFail.displayFailure(jqXHR, exception)
            }
        })
    }
}