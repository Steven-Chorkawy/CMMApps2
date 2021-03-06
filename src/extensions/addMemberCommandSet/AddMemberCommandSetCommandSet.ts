import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'AddMemberCommandSetCommandSetStrings';
import { sp } from '@pnp/sp';
import { GetMembers } from '../../ClaringtonHelperMethods/MyHelperMethods';
import AddMemberSidePanel from '../../ClaringtonComponents/AddMemberSidePanel';
import RenewMemberSidePanel, { IRenewMemberSidePanelProps } from '../../ClaringtonComponents/RenewMemberSidePanel';


/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IAddMemberCommandSetCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

const LOG_SOURCE: string = 'AddMemberCommandSetCommandSet';

export default class AddMemberCommandSetCommandSet extends BaseListViewCommandSet<IAddMemberCommandSetCommandSetProperties> {

  @override
  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized AddMemberCommandSetCommandSet');
    await super.onInit().then(() => {
      sp.setup({
        spfxContext: this.context,
        sp: {
          headers: {
            "Accept": "application/json; odata=nometadata"
          },
          baseUrl: this.context.pageContext.web.absoluteUrl
        }
      });
    });

    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const compareRenewCommand: Command = this.tryGetCommand('COMMAND_RENEW_MEMBER');

    console.log('onListViewUpdated');
    console.log(event);

    if (compareRenewCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareRenewCommand.visible = event.selectedRows.length === 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    const div = document.createElement('div');
    console.log('onExecute');
    console.log(event);

    switch (event.itemId) {
      case 'COMMAND_ADD_MEMBER':
        const addMemberElement: React.ReactElement<any> = React.createElement(AddMemberSidePanel, {
          isOpen: true,
          context: this.context,
        });
        ReactDOM.render(addMemberElement, div);
        break;
      case 'COMMAND_RENEW_MEMBER':
        const renewMemberElement: React.ReactElement<any> = React.createElement(RenewMemberSidePanel, {
          context: this.context,
          isOpen: true,
          committeeMemberID: event.selectedRows[0].getValueByName('SPFX_CommitteeMemberDisplayName')[0].lookupId
        });
        ReactDOM.render(renewMemberElement, div);
        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
