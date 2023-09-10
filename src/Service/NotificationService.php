<?php
namespace App\Service;

use App\Entity\Echeance;
use Doctrine\Persistence\ManagerRegistry;

class NotificationService{

    private $doctrine;
    public function __construct(ManagerRegistry $doctrine) {
        $this->doctrine = $doctrine;
    }

    /**
     * Renvoie le total des échéances en cours pour les transmettre à l'onglet notifications
     */
    public function getEcheanceNotification(){
        $echeanceRepo = $this->doctrine->getRepository(Echeance::class);
        $echeances = $echeanceRepo->findBy(['finEcheance' => null], ['echeance' => 'DESC']);
        $totalEcheances = count($echeances);
        $echeanceData = [["totalEcheances" => $totalEcheances], []];

        if($echeances){
            foreach($echeances as $item){
                $data = [
                    "matricule" => $item->getMatricule(), 
                    "agentCausal" => $item->getagentCausal(), 
                    "dateEcheance" => $item->getEcheance(),
                    "dateEcheanceFr" => $item->getEcheance()->format('d/m/Y')
                ];

                $echeanceData[1][]= $data;
            }
        }
        return $echeanceData;
    }
    
}