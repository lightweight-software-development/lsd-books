const React = require('react')
const { connect } = require('react-redux')
const {PropTypes} = require('react')
const FormItem = require('./FormItem')

let EntityView = React.createClass({
    render: function () {
        this.formChanges = {}
        const change = (name) => (value) => this.onChange(name, value)
        const entity = this.props.entity
        const entityDescriptor = entity.constructor.entityDescriptor || this.props.entityDescriptor
        if (!entityDescriptor) throw new Error('EntityDescriptor required')
        const entityName = entityDescriptor.name
        return (
            <div >
                <h2>{entity.id ? `${entityName} ${entity.description}` : `New ${entityName}`}</h2>
                <form>
                    {entityDescriptor.propertyNames.map( name => this.formItem(entityDescriptor.propertyDescriptor(name), entity[name]) )}
                </form>
                <button type="submit" className="btn btn-default" onClick={this.onSave}>Save</button>
            </div>
        )
    },

    onChange: function(name, value) {
        this.formChanges[name] = value
    },

    onSave: function(e) {
        console.log('save', this.formChanges)
        e.preventDefault()
        if (this.props.entity.id) {
            this.props.onUpdateEntity(Object.assign({id: this.props.entity.id}, this.formChanges))
        } else {
            this.props.onAddEntity(this.formChanges)
        }
    },

    formItem: function(propDesc, value) {
        const changeFn = this.onChange.bind(this, propDesc.name)
        return <FormItem type={propDesc.type} onChange={changeFn} value={value} label={propDesc.label} placeholder={propDesc.placeholder} help={propDesc.help}/>
    }
})

EntityView.propTypes = {
    entityDescriptor: PropTypes.object,
    entity: PropTypes.object.isRequired,
    onUpdateEntity: PropTypes.func.isRequired,
    onAddEntity: PropTypes.func.isRequired
}

module.exports = EntityView