import { Component, OnInit } from '@angular/core';
import {
  IPageChangeEvent,
  ITdDataTableColumn, ITdDataTableSortChangeEvent, TdDataTableService,
  TdDataTableSortingOrder
} from "@covalent/core";
import {TaskService} from "../../../../../../services/task.service";
import {MatDialog} from "@angular/material";
import {SpecialTaskService} from "../../../../../../services/special-task.service";
import {GamemasterSpecialTaskCreateComponent} from "./components/gamemaster-special-task-create/gamemaster-special-task-create.component";
import {GamemasterSpecialTaskEditComponent} from "./components/gamemaster-special-task-edit/gamemaster-special-task-edit.component";
import {QuestService} from "../../../../../../services/quest.service";
import {AdventureService} from "../../../../../../services/adventure.service";

@Component({
  selector: 'app-gamemaster-special-task',
  templateUrl: './gamemaster-special-task.component.html',
  styleUrls: ['./gamemaster-special-task.component.css']
})
export class GamemasterSpecialTaskComponent implements OnInit {

  data: any[] = [];
  columns: ITdDataTableColumn[] = [
    { name: 'id', label: 'Id'},
    { name: 'title', label: 'Titel',width: 200 },
    { name: 'gold', label: 'Gold'},
    { name: 'xp', label: 'XP'},
    { name: 'message', label: 'Auftrag'},
    { name: 'quest.title', label: 'Quest'},
    { name: 'status', label: 'Status'},
    { name: 'edit', label: ''}
  ]

  // Sort / Filter / Paginate variables
  filteredData: any[] = this.data
  filteredTotal: number = this.data.length
  searchTerm = '';
  fromRow = 1;
  currentPage = 1;
  pageSize = 5;
  sortBy = 'id';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  constructor(
    private specialTaskService: SpecialTaskService,
    private questService: QuestService,
    private adventureService: AdventureService,
    private _dataTableService: TdDataTableService,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks(){
    return this.specialTaskService.getSpecialTasks().subscribe(tasks => {
      this.data = tasks;
      this.filter();
    });
  }

  newSpecialTask(){
    this.dialog.open(GamemasterSpecialTaskCreateComponent,{width:"500px"}).afterClosed().subscribe(()=>this.loadTasks())
  }

  editSpecialTask(specialTask){
    this.dialog.open(GamemasterSpecialTaskEditComponent,{width:"500px",data:specialTask}).afterClosed().subscribe(()=>this.loadTasks());
  }

  deleteSpecialTask(specialTask){
    this.specialTaskService.deleteSpecialTask(specialTask).then(()=>this.loadTasks())
  }

  solveSpecialTask(specialTask){
    this.specialTaskService.solveSpecialTask(specialTask).then(()=>{
      this.loadTasks();
      this.questService.refreshQuests();
      this.adventureService.refreshAdventures();
    })
  }


  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.filter();
  }

  search(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filter();
  }

  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.filter();
  }

  filter(): void {
    let newData: any[] = this.data;
    const excludedColumns: string[] = this.columns
      .filter((column: ITdDataTableColumn) => {
        return ((column.filter === undefined && column.hidden === true) ||
        (column.filter !== undefined && column.filter === false));
      }).map((column: ITdDataTableColumn) => {
        return column.name;
      });
    newData = this._dataTableService.filterData(newData, this.searchTerm, true, excludedColumns);
    this.filteredTotal = newData.length;
    newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    this.filteredData = newData;
  }



}