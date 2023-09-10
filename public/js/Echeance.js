class Echeance 
{
    /**
     * Crée une nouvelle échéance et modifie l'ancienne en rappel courrier
     * @param {*} refCourrier reference du courrier
     * @param {*} echeanceRow ligne correspondant à l'échéance sélectionnée
     * @param {*} echeanceId 
     * @param {*} idCourrier 
     * @param {CallableFunction} echeanceNotificationCallback
     */
    creerEcheance(refCourrier, echeanceRow, echeanceId, idCourrier, echeanceNotificationCallback)
    {
        let matricule = $("#synthese_matricule").attr('data-matricule');
        let agentCausal = $('#synthese_agentCausal').attr('data-agentCausal');
        const responseFail = new ResponseFail;
        const cellGenerator = new CellGenerator;

        $.ajax({
            type: "POST",
            url: Routing.generate("dossier_rappel_echeance"),
            data: {
                'matricule': matricule,
                'agentCausal': agentCausal,
                'refCourrier': refCourrier,
                'echeanceId': echeanceId,
                'idCourrier': idCourrier
            },
            
            success: function (response) {
                if (response != "error_echeance" && response != "error_idCourrier") {
                    try {
                        echeanceNotificationCallback();
                        let urlCourrier = Routing.generate("app_courrier_print", { 'id': idCourrier, 'rappel' : 'true'});
                        cellGenerator.generateRappelEcheance(response, echeanceRow, idCourrier, urlCourrier);
                        Swal.fire({
                            icon: 'success',
                            title: 'Rappel créé !',
                        }).then(()=>{
                            //On lance le téléchargement du courrier et on ajoute le parametre rappel dans la route
                            location.href = Routing.generate("app_courrier_print", { 'id': idCourrier, 'rappel' : 'true'});
                        });
                        
                    }
                    catch (err) {
                        console.log(err);
                    }

                }
                else {
                    console.log("l'echeance n'a pas pu être créée");
                }
            },

            error: function (jqXHR, exception) {
                responseFail.displayFailure(jqXHR, exception);
            }
        })
    }

    /**
     * Permet de supprimer l'échéance actuelle et de la remplacer par le rappel précédent.
     * @param {*} refCourrier 
     * @param {*} deleteButton 
     * @param {*} idCourrier 
     * @param {*} idEcheance 
     */
    annulerEcheance(refCourrier, deleteButton, idCourrier, idEcheance, echeanceNotificationCallback)
    {
        const cellGenerator = new CellGenerator;
        const responseFail = new ResponseFail;
        let matricule = $("#synthese_matricule").attr('data-matricule');
        let agentCausal = $('#synthese_agentCausal').attr('data-agentCausal');

        $.ajax({
            type: "POST",
            url: Routing.generate("dossier_echeance_remove"),
            data: {
                'matricule': matricule,
                'agentCausal': agentCausal,
                'refCourrier': refCourrier,
                'idEcheance' : idEcheance
            },

            success: function (response) {

                if (response != 'error_annulation_echeance') {
                    try {
                        echeanceNotificationCallback();
                        if (response.rappelVerif) {
                            //on cible ici, grâce à deleteButton, le bloc contenant toutes les informations de l'échéance
                            let echeanceRowParent = deleteButton.parents('.echeance_row');
                            
                            cellGenerator.CancelRappelEcheance(response, echeanceRowParent, idCourrier, refCourrier);
                        }
                        
                    }
                    catch (err) {
                        console.log(err);
                    }

                }
                else {
                    console.log("annulation impossible !")
                }
            },

            error: function (jqXHR, exception) {
                responseFail.displayFailure(jqXHR, exception);
            }
        })
    }

    /**
     * Permet d'attribuer une date de fin à l'échéance sélectionnée
     * @param {*} endButton 
     * @param {*} finEcheance 
     * @param {*} echeanceNotificationCallback update des notifications 
     */
    terminerEcheance(endButton, finEcheance, echeanceNotificationCallback)
    {
        const responseFail = new ResponseFail;
        let matricule = $("#synthese_matricule").attr('data-matricule');
        let agentCausal = $('#synthese_agentCausal').attr('data-agentCausal');
        let id = endButton.attr('data-echeanceId');

        $.ajax({
            type: "POST",
            url: Routing.generate('dossier_echeance_end'),
            data: {
                "id": id,
                "finEcheance": finEcheance,
                "matricule": matricule,
                "agentCausal": agentCausal
            },

            success: function (response) {
                if (response != "echeance_delete_error") {
                    echeanceNotificationCallback();
                    let echeance = "<p class='col-sm-7'>" + response.echeance + " - " + response.libEcheance + "(Fin échéance)</p><div class='col-sm-4'><p class='echeance_label col-sm-4'>Fin échéance le : </p><p class='col-sm-5 date_fin_echeance'>" + response.finEcheance + "</p></div><p class='col-sm-1'></p>";

                    endButton.parent().html(echeance);
                }
                else {
                    console.log("impossible de terminer l'échéance")
                }
            },

            error: function (jqXHR, exception) {
                responseFail.displayFailure(jqXHR, exception);
            }
        })
    }

    updateEcheanceNotification(){
        const responseFail = new ResponseFail;
        let today = new Date;
        $.ajax({
            url: Routing.generate('app_update_notifications'),
            type: 'GET',
            success: function(response){
                if(response[0].totalEcheances !== 0){
                    try{

                        let row;
                        $('#liste_echeance_notif').html("");
                        $('#badge_echeance_notif').text(response[0].totalEcheances);
                        $('#title_echeance_notif').text(`${response[0].totalEcheances} échéance(s) en cours`);
                        $('#badge_echeance_notif').show();

                        for(let notif of response[1]){
                            let url = Routing.generate('app_dossiers_lire', {'matricule' : notif.matricule, 'codeCausal' : notif.agentCausal});

                            if(new Date(notif.dateEcheance.date) < today){
                                row = `<li><a href=${url}><i class="fa fa-hourglass-end icon_notif2"></i>&nbsp;&nbsp;&nbsp;Echéance du ${notif.dateEcheanceFr}</a></li>`
                            }
                            else{
                                row = `<li><a href=${url}><i class="fa fa-hourglass-half icon_notif"></i>&nbsp;&nbsp;&nbsp;Echéance du ${notif.dateEcheanceFr}</a></li>`
                            }
                            $('#liste_echeance_notif').append(row);
                        }
                    }
                    catch(err){
                        console.log(err)
                    }
                }
                else{
                    $('#badge_echeance_notif').hide();
                    $('#title_echeance_notif').text(`Aucune échéance en cours`);
                    $('#liste_echeance_notif').html("");
                }
            },
            error: function(jqXHR, exception){
                responseFail.displayFailure(jqXHR, exception);
            }
        })
    }
}