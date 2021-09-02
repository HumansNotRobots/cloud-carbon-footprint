/*
 * © 2021 Thoughtworks, Inc.
 */

import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import { DropdownSelections } from '../FiltersUtil'
import { ALL_DROPDOWN_FILTER_OPTIONS, ALL_KEY } from '../DropdownConstants'

export abstract class OptionChooser {
  protected readonly filterType: DropdownFilterOptions
  protected readonly allOptions: DropdownOption[]
  protected selections: DropdownOption[]
  protected readonly oldSelections: DropdownSelections
  protected readonly filterOptions: FilterOptions

  private readonly choosers = {
    [DropdownFilterOptions.CLOUD_PROVIDERS]: () => this.chooseProviders(),
    [DropdownFilterOptions.ACCOUNTS]: () => this.chooseAccounts(),
    [DropdownFilterOptions.SERVICES]: () => this.chooseServices(),
  }

  protected constructor(
    filterType: DropdownFilterOptions,
    allOptions: DropdownOption[],
    selections: DropdownOption[],
    oldSelections: DropdownSelections,
    filterOptions: FilterOptions,
  ) {
    this.allOptions = allOptions
    this.filterType = filterType
    this.selections = selections
    this.oldSelections = oldSelections
    this.filterOptions = filterOptions
  }

  protected abstract chooseProviders(): Set<DropdownOption>

  protected abstract chooseAccounts(): Set<DropdownOption>

  protected abstract chooseServices(): Set<DropdownOption>

  choose(): DropdownSelections {
    const selectionKeys: string[] = this.selections.map(
      (selection) => selection.key,
    )
    const oldSelectionKeys: string[] = this.oldSelections[this.filterType].map(
      (oldSelection) => oldSelection.key,
    )

    const allOptionsAreSelected =
      selectionKeys.includes(ALL_KEY) ||
      selectionKeys.length === this.allOptions.length - 1
    const allOptionsWereSelected = oldSelectionKeys.includes(ALL_KEY)
    if (allOptionsAreSelected && !allOptionsWereSelected) {
      this.selections = this.allOptions
    }

    const selectionOptions: string[] = Object.keys(this.oldSelections)

    if (!selectionKeys.includes(ALL_KEY) && allOptionsWereSelected) {
      return Object.fromEntries(selectionOptions.map((option) => [option, []]))
    } else {
      if (
        this.selections.length === this.allOptions.length - 1 &&
        allOptionsWereSelected
      ) {
        this.selections = this.selections.filter((k) => k.key !== ALL_KEY)
      }

      return Object.fromEntries(
        selectionOptions.map((option) => [
          option,
          this.addAllDropDownOptions(
            this.choosers[option](),
            option as DropdownFilterOptions,
          ),
        ]),
      )
    }
  }

  private addAllDropDownOptions(
    currentSelections: Set<DropdownOption>,
    filterType: DropdownFilterOptions,
  ): DropdownOption[] {
    const revisedSelections: DropdownOption[] = Array.from(currentSelections)
    if (currentSelections.size === this.filterOptions[filterType].length - 1) {
      revisedSelections.unshift(ALL_DROPDOWN_FILTER_OPTIONS[filterType])
    }

    return revisedSelections
  }
}