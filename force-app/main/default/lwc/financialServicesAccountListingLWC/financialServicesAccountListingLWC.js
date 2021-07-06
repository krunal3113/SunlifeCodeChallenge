/************************************************ 
 * Author: Krunal Shah
 * Date: 6th July 2021
 * Description: Displaying financial service accounts
*/
import { LightningElement,wire, track } from 'lwc';
import getFinancialServicesAccountRecords from '@salesforce/apex/FinancialServicesController.getFinancialServicesAccounts';
import getSearchedAccountRecords from '@salesforce/apex/FinancialServicesController.getSearchedAccounts';
import updateAccounts from '@salesforce/apex/FinancialServicesController.updateAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

/*
* Description: Financial Services account columns
*/
const columns = [
    {
        label: 'Name',
        fieldName: 'nameUrl',
        type: 'url',
        typeAttributes: {label: { fieldName: 'Name' }, target: '_blank'},
        editable: false,
        sortable:true
    }, {
        label: 'Owner',
        fieldName: 'OwnerName__c',
        type: 'text',
        editable: false,
        sortable:true
    }, {
        label: 'Website',
        fieldName: 'Website',
        type: 'url',
        editable: true,
    }, {
        label: 'Phone',
        fieldName: 'Phone',
        type: 'phone',
        editable: true,
    }, {
        label: 'AnnualRevenue',
        fieldName: 'AnnualRevenue',
        type: 'currency',
        editable: true
    }
];
export default class FinancialServicesAccountListingLWC extends LightningElement {
    @track
    columns = columns;

    @track
    accounts;

    @track
    draftValues = [];

    @track
    sortedBy;

    @track
    defaultSortDirection = 'asc';

    @track
    sortDirection = 'asc';

    /* 
     * Description: Retrive financial service account data
    */
    @wire(getFinancialServicesAccountRecords)
    accountRecs({ error, data }) {
        if (data) {
            let tempAccList = []; 
            //Logic for navigating account record on clicking account name
            data.forEach((record) => {
                let tempAccRec = Object.assign({}, record);  
                tempAccRec.nameUrl = '/' + tempAccRec.Id;
                tempAccList.push(tempAccRec);
            });
            this.accounts = tempAccList;
        } else if (error) {
            this.error = result.error;
        }
    }

    /*
    * Description: Update the account data
    */
    async handleSave( event ) {
        const updatedFields = event.detail.draftValues;
        await updateAccounts( { data: updatedFields } )
        .then( result => {

            console.log( JSON.stringify( "Apex update result: " + result ) );
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account(s) updated',
                    variant: 'success'
                })
            );
            this.draftValues = [];

        }).catch( error => {
            console.log( 'Error is ' + JSON.stringify( error ) );
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or refreshing records',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }

    /*
     * Description: Handle sorting click
     */
    onHandleSort( event ) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.accounts];

        cloneData.sort( this.sortBy( sortedBy, sortDirection === 'asc' ? 1 : -1 ) );
        this.accounts = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

    /*
    * Description: Sort value
    */
    sortBy( field, reverse, primer ) {
        const key = primer
            ? function( x ) {
                  return primer(x[field]);
              }
            : function( x ) {
                  return x[field];
              };

        return function( a, b ) {
            a = key(a);
            b = key(b);
            return reverse * ( ( a > b ) - ( b > a ) );
        };
    }

    /*
    * Search on enter keyword
    */
    handleKeyChange( event ) {
        const searchKey = event.target.value;
        if ( searchKey ) {
            getSearchedAccountRecords( { searchKey } )   
            .then(result => {
                //this.accounts = result;
                let tempAccList = []; 
                //Logic for navigating account record on clicking account name
                result.forEach((record) => {
                    let tempAccRec = Object.assign({}, record);  
                    tempAccRec.nameUrl = '/' + tempAccRec.Id;
                    tempAccList.push(tempAccRec);
                });
                this.accounts = tempAccList;
            })
            .catch(error => {
                this.error = error;
            });
        } else
        this.accounts = undefined;
    }
}