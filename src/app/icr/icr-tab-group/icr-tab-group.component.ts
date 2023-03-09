import { ChangeDetectorRef, Component, Input } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Icr } from "../icr";
import { IcrService } from "../icr.service";
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import { faFileCode } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import {faKey} from '@fortawesome/free-solid-svg-icons'
@Component({
    selector: 'app-icr-tab-group',
    templateUrl: './icr-tab-group.component.html',
    styleUrls: ['./icr-tab-group.component.scss']
})
export class IcrTabGroupComponent {
    @Input() icr: Icr;
    @Input() expanded: boolean = false;

    get faGlobe() {
        return faGlobe;
    }
    get faCloud() {
        return faCloud;
    }
    get faFileCode() {
        return faFileCode;
    }
    get faInfo() {
        return faCircleInfo;
    }
    get faBell() {
        return faBell;
    }
    get faKey() {
        return faKey;
    }
    get displayedColumns(): string[] {
        if (this.expanded) {
            return ['file', 'value', 'name', 'direction', 'location', 'method', 'description'];
        }
        else {
            return ['file', 'value', 'direction', 'method'];
        }
    }
    variableDisplayedColumns: string[] = ['name', 'type', 'description'];

    public constructor(private icrService: IcrService, public dialog: MatDialog, private changeDetectorRef: ChangeDetectorRef) { }

}