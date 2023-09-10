<?php

namespace App\Controller;

use App\Repository\AssureRepository;
use App\Repository\CourrierRepository;
use App\Repository\DemandeRepository;
use App\Repository\EcheanceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ExportController extends AbstractController
{
    /**
     * @Route("/export", name="export")
     */
    public function exportTest(CourrierRepository $courrierRepo): Response
    {
        $data = $courrierRepo->getCourrierPerYear();
        $csv = "";
        foreach($data as $tab){
            foreach($tab as $key => $value){
                $csv.= $value.";";
            }
            $csv.= "\n";
        }


        return new Response(
            $csv,
            200,
            [
                'Content-Type' => 'application/vnd.ms-excel',
                "Content-disposition" => "attachement; filename=Test.csv"
            ]
            );
    }

    public function exportDemandeData(DemandeRepository $demandeRepo, Request $request, $statutData, $agentCausal, $selectedYear){

        $statut = "";

        switch($statutData){
            case 'Clôturées':
                $statut = 'clos';
            break;
            case 'Refusées':
                $statut = 'refus';
            break;
            case 'Acceptées':
                $statut = 'acc';
            break;
            case 'En cours': 
                $statut = '';
            break;
        }

        $data = $demandeRepo->getDemandeData($agentCausal, $selectedYear, $statut);
        return $this->createCsv($data, "Export_demande_".$selectedYear."_".$agentCausal);
    }

    public function exportEcheanceData(EcheanceRepository $echeanceRepo, $year, $finEcheance){
        $data = $echeanceRepo->echeanceDatatable($finEcheance, $year);
        return $this->createCsv($data, "Export_echeance_$year");
    }

    public function exportAssureData(DemandeRepository $demandeRepo, $situation){
        $data = $demandeRepo->getAssureData($situation);
        return $this->createCsv($data, "Export_assure_$situation");
    }

    public function exportCourrierData(CourrierRepository $courrierRepo, $year, $agentCausal){
        $data = $courrierRepo->getCourrierData($year, $agentCausal);
        return $this->createCsv($data, "Export_courrier_".$year."_".$agentCausal);
    }

    public function createCsv($data, $fileName){
        $csv = "";

        foreach($data[0] as $index => $tab){
                $csv.= strtoupper("$index;");
        }

        $csv .= "\n";

        foreach($data as $index => $tab){
            foreach($tab as $key => $value){
                if(!empty($value)){
                    if($key === "matricule"){
                        $csv.= "'".mb_convert_encoding($value, "ISO-8859-1") ."';";
                    }else{
                        $csv.= mb_convert_encoding($value, "ISO-8859-1") .";";
                    }
                }
                else{
                    $csv.=" ;";
                }
            }
            $csv.= "\n";
        }

        return new Response(
            $csv,
            200,
            [
                'Content-Type' => 'application/vnd.ms-excel',
                "Content-disposition" => "attachement; filename=$fileName.csv"
            ]
        );
    }
}
