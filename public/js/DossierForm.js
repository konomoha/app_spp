class DossierForm
{
    /**
     * Effectue des contrôles de champs dynamiquement. Lorsque que tous les champs sont valides, le bouton d'envoi du formulaire est activé
     */
    dossierFieldControl() {

        let nom = $("#nom").val();
        let prenom = $("#prenom").val();
        let nomMarital = $('#nom_marital').val();
        let codePostal = $("#code_postal").val();
        let medTraitant = $("#med_traitant").val();
        let siret = $('#siret').val();
        let debExpo = $("#deb_expo").val();
        let finExpo = $("#fin_expo").val();
        let debSoins = $('#deb_soins').val();
        let finSoins = $('#fin_soins').val();
        let dateEnr = $('#date_enr').val();
        let signataire = $("#numagt").val();

        let errNom = false;
        let errPrenom = false;
        let errNomMarital = false;
        let errCodePostal = false;
        let errMedTraitant = false;
        let errSiret = false;
        let errDebExpo = false;
        let errFinExpo = false;
        let errFinSoins = false;
        let errSignataire = false;

        if (!isNaN(nom) || nom.length === 0) {
            $('#error_nom').show();
            errNom = true;
        }
        else {
            $('#error_nom').hide();
            errNom = false;
        }

        if (!isNaN(prenom) || prenom.length === 0) {
            $('#error_prenom').show();
            errPrenom = true;
        }
        else {
            $('#error_prenom').hide();
            errPrenom = false;
        }

        if (nomMarital.length !== 0) {
            if (!isNaN(nomMarital)) {
                $('#error_nom_marital').show();
                errNomMarital = true;
            }
            else {
                $('#error_nom_marital').hide();
                errNomMarital = false;
            } 
        }
        else{
            $('#error_nom_marital').hide();
            errNomMarital = false;
        }
        
        if (codePostal.length !== 0) {
            if (!isNaN(codePostal)) {
                $("#error_code_postal").hide();
                errCodePostal = false;
            }
            else {
                $('#error_code_postal').show();
                errCodePostal = true; 
            }
        }
        else {
            $("#error_code_postal").hide();
            errCodePostal = false;
        }

        if(medTraitant.length !== 0){
            if(isNaN(medTraitant)){
                $('.errvalid_medTraitant').show();
                $('.err_medTraitant').hide();
                errMedTraitant = true;
            }
            else{
                if(medTraitant.length < 9){
                    $('.infos_medecin small').html('');
                    $('.infos_medecin').hide();

                    $('.err_medTraitant').show();
                    $('.errvalid_medTraitant').hide();
                    errMedTraitant = true;
                }
                else{
                    $('.err_medTraitant').hide();
                    $('.errvalid_medTraitant').hide();
                    errMedTraitant = false;

                    $.ajax({
                        url: Routing.generate('app_demande_infos_med'),
                        type: "POST",
                        data:{
                            numMedTraitant: medTraitant
                        },

                        success: function(response){                       
                            if(response !== 'error_medTraitant'){
                                let dataMed = response.nom_usage + " " + response.prenom + " " + response.num_voie + " " + response.nom_voie + " " + response.code_postal + " " + response.commune;

                                $('.infos_medecin small').html(dataMed);
                                $('.infos_medecin').show();
                            }
                            else{
                                $('.infos_medecin small').html('');
                                $('.infos_medecin').hide();
                            }
                        },
                        error: function(){
                            console.log('passe pas');
                        }
                    })
                }
            }
        }
        else{

            $('.err_medTraitant').hide();
            $('.errvalid_medTraitant').hide();

            $('.infos_medecin small').html('');
            $('.infos_medecin').hide();
            errMedTraitant = false;
        }

        if (siret.length !== 0) {
            if (!isNaN(siret)) {
                $("#error_siret").hide();
            }
            else {
                $('#error_siret').show();
                errSiret = true;
            }
        }
        else {
            $("#error_siret").hide();
            errSiret = false;
        }

        if (debExpo.length !== 0){
            if (!isNaN(debExpo)) {
                if (debExpo <= (new Date()).getFullYear() && debExpo >= 1930) {
                    $('#error_debExpo').hide();
                    $('#error_debExpo_sup').hide();
                    errDebExpo = false;
                }
                else {

                    $('#error_debExpo').hide();
                    $('#error_debExpo_sup').show();
                    errDebExpo = true;
                }
            }

            else {
                $('#error_debExpo').show();
                $('#error_debExpo_sup').hide();
                errDebExpo = true;
            }
        }
        else {
            $('#error_debExpo').hide();
            $('#error_debExpo_sup').hide();
            errDebExpo = false;
        }

        if (finExpo.length !== 0) {
            if (!isNaN(finExpo)) {
                if (finExpo <= (new Date).getFullYear() && finExpo >= 1930) {
                    if (finExpo >= debExpo) {
                        $('#error_finExpo').hide();
                        $('#error_finExpo_inf').hide();
                        $('#error_finExpo_sup').hide();
                        errFinExpo = false;
                    }
                    else {
                        $('#error_finExpo').hide();
                        $('#error_finExpo_sup').hide();
                        $('#error_finExpo_inf').show();
                        errFinExpo = true;
                    }
                }
                else {
                    $('#error_finExpo').hide();
                    $('#error_finExpo_sup').show();
                    $('#error_finExpo_inf').hide();
                    errFinExpo = true;
                }
            }
            
            else {
                $('#error_finExpo').show();
                $('#error_finExpo_sup').hide();
                $('#error_finExpo_inf').hide();
                errFinExpo = true;
            }

        }
        else {
            $('#error_finExpo').hide();
            $('#error_finExpo_sup').hide();
            $('#error_finExpo_inf').hide();
            errFinExpo = false;
        }

        if (finSoins) {
            if (finSoins < debSoins) {
                errFinSoins= true;
                $('.err_fin_soins').show();
            }
            else {
                errFinSoins= false;
                $('.err_fin_soins').hide();
            }
        }
        else {
            errFinSoins= false;
            $('.err_fin_soins').hide();
        }

        if (signataire.length !== 0) {
            if (isNaN(signataire)) {  
                $('#error_signataire').show();
                $('#error_signataire_empty').hide();
                errSignataire = true;
            }
            
            else {
                $('#error_signataire').hide();
                $('#error_signataire_empty').hide();
            }
        }
        else {
            $('#error_signataire_empty').show();
            $('#error_signataire').hide();
            errSignataire = true;
        }
            
        //Enregistrement des pièces

        if (dateEnr) {
            $('#bouton_piece_form').removeAttr("disabled");
            // console.log("date sélectionée : " + dateEnr);
        }
        else {
            $('#bouton_piece_form').attr("disabled", true);
            // console.log("pas de date sélectionnée");
        }


        if (!errNom && !errPrenom && !errNomMarital && !errCodePostal && !errSiret && !errDebExpo && !errFinExpo && !errSignataire && !errFinSoins && !errMedTraitant) {
            $(".validation_bouton").attr("disabled", false);
        }
        else {
            $(".validation_bouton").attr("disabled", true);
        }   
    }
}