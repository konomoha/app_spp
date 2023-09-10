class DemandePiece
{
    /**
     * Permet de créer une nouvelle pièce pour le dossier. La nouvelle pièce insérée en bdd est affichée dynamiquement dans le tableau pièces enregistrées
     */
    creerPiece()
    {
        const responseFail = new ResponseFail;
        let matricule = $("#synthese_matricule").attr('data-matricule');
        let agentCausal = $('#synthese_agentCausal').attr('data-agentCausal');
        let codePiece = $("#libelle_piece").val();
        let dateEnr = $('#date_enr').val();
        let contestationData = $(".contestation_assure:checked");
        let contestation;

        for(let item of contestationData){
            if(item.checked){
                contestation = item.value;
            }
        }

        $.ajax({
            url: Routing.generate("dossierCreerPiece", { 'id': matricule, 'codeCausal': agentCausal }),
            type: "POST",
            data: {
                'matricule': matricule,
                'agentCausal': agentCausal,
                'codePiece': codePiece,
                'dateEnr': dateEnr,
                'contestation': contestation
            },

            success: function (response) {
                if (response != 'error_piece') {
                    try {
                        //Création d'une nouvelle ligne de pièce enregistrée
                        let row = "<tr><td><p>" + response.libelle + "</p></td><td><p>" + response.date_reception + "</p><td><p>" + response.information + "</p></td><td><a class='text-danger bouton_piece_supprimer' href='' data-piece='" + response.demandePieceId + "' title='supprimer pièce'><i class='fa fa-trash-alt' aria-hidden='true'></i></a></td></tr>";

                        $('#table_piece_body').prepend(row);
                        $('#date_enr').val("").change();
                        $("#bouton_piece_form").attr('disabled', true);

                        Swal.fire({
                            icon: 'success',
                            title: 'Pièce enregistrée',
                            text: 'Saisir la date de fin échéance si la pièce enregistrée est celle attendue.',
                        });
                    }
                    catch (err) {
                        console.log(err)
                    }
                }
                else {
                    console.log('aucune date sélectionnée');
                    $('.err_date_piece').show();
                }
            },
            error: function (jqXHR, exception) {
                responseFail.displayFailure(jqXHR, exception);
            }
        });
    }

    /**
     * Permet de supprimer une piece enregistrée
     * @param {*} idPiece 
     * @param {*} pieceRow ligne du tableau correspondant à la pièce que l'on supprime
     */
    supprimerPiece(idPiece, pieceRow)
    {
        let matricule = $("#synthese_matricule").attr('data-matricule');
        let agentCausal = $('#synthese_agentCausal').attr('data-agentCausal');
        let responseFail = new ResponseFail;

        $.ajax({
            type: "POST",
            url: Routing.generate("dossier_piece_delete"),
            data: {
                'id': idPiece,
                'agentCausal': agentCausal,
                'matricule': matricule
            },
            success: function (response) {
                if (response !== "error_piece_delete") {
                    try {
                        //suppression de la ligne dans le tableau des pieces enregistrées
                        pieceRow.remove(); 
                    }
                    catch (err) {
                        console.log(err);
                    } 
                }
                else {
                    console.log("suppression piece impossible")
                }     
            },
            error: function (jqXHR, exception) {
                responseFail.displayFailure(jqXHR, exception);
            }
        })
    }

    /**
     * Si la pièce 'contestation assuré' est sélectionnée, affichage d'un champ complémentaire
     */
    afficherchampsPiece()
    {
        let piece = $("#libelle_piece").val();

        if (piece === "cs") {
            $("#contestation_assure").css("display", 'flex');
            $("#contestation_assure").show();
        }
        else {
            $("#contestation_assure").css("display", 'none');
        }
    }
}