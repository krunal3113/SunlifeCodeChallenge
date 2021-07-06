/************************************************ 
 * Author: Krunal Shah
 * Date: 6th July 2021
 * Description: FinancialServicesController, This class is use to displaying, searching and updating financial service data from financial service LWC component
*/
public with sharing class FinancialServicesController {
    /*
    * Description: get financial services data
    */
    @AuraEnabled(Cacheable = true)
    public static List<Account> getFinancialServicesAccounts() {
        return [SELECT Id, Name, OwnerName__c, Website, Phone, AnnualRevenue  
                FROM Account 
                WHERE Industry = 'Financial Services' ];
    }

    /*
    * Description: Account search method
    * @searchKey: account search parameter
    */
    @AuraEnabled(Cacheable = true)
    public static List<Account> getSearchedAccounts(String searchKey) {
        String strKey = '%' + searchKey + '%';
        return [ SELECT Id, Name, OwnerName__c, Website, Phone, AnnualRevenue FROM Account WHERE Name LIKE: strKey AND Industry = 'Financial Services'];
    }

    /*
    * Description: Update the inline edited record 
    * @data param: contains account records
    */
    @AuraEnabled
    public static string updateAccounts(Object data) {
        List<Account> accsForUpdate = (List<Account>) JSON.deserialize(
            JSON.serialize(data),
            List<Account>.class
        );
        try {
            update accsForUpdate;
            return 'Success: Account(s) updated successfully';
        }
        catch (Exception e) {
            return 'The following exception has occurred: ' + e.getMessage();
        }
    }
}